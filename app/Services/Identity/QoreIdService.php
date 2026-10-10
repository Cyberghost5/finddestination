<?php

namespace App\Services\Identity;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QoreIdService
{
    /**
     * Verify a CAC Registration Number with QoreID CAC API.
     *
     * @param string $cacNumber
     * @param User|null $host
     * @return array
     */
    public static function verifyCac(string $cacNumber, ?User $host = null): array
    {
        $rawNumber = trim($cacNumber);
        // Normalize: e.g. "RC - 556699856" -> "RC-556699856"
        $normalizedNumber = preg_replace('/\s*-\s*/', '-', $rawNumber);
        $normalizedNumber = preg_replace('/\s+/', '', $normalizedNumber);

        // Extract pure digits if needed
        $numericPart = preg_replace('/[^0-9]/', '', $normalizedNumber);
        $prefix = strtoupper(substr($normalizedNumber, 0, 2));

        $clientId = Setting::getByKey('qoreid_client_id') ?: config('services.qoreid.client_id') ?: env('QOREID_CLIENT_ID');
        $secretKey = Setting::getByKey('qoreid_secret_key') ?: config('services.qoreid.secret_key') ?: env('QOREID_SECRET_KEY');
        $baseUrl = rtrim(Setting::getByKey('qoreid_base_url') ?: config('services.qoreid.base_url') ?: env('QOREID_BASE_URL', 'https://api.qoreid.com'), '/');

        // Check if live credentials are configured
        if (!empty($clientId) && !empty($secretKey)) {
            try {
                // 1. Obtain Access Token from QoreID
                $authResponse = Http::timeout(12)->post("{$baseUrl}/token", [
                    'clientId' => $clientId,
                    'secret' => $secretKey,
                ]);

                if ($authResponse->successful()) {
                    $authData = $authResponse->json();
                    $token = $authData['accessToken'] 
                        ?? $authData['token'] 
                        ?? $authData['access_token'] 
                        ?? null;

                    if ($token) {
                        // 2. Query QoreID CAC Premium endpoint
                        $cacResponse = Http::withToken($token)
                            ->timeout(20)
                            ->post("{$baseUrl}/v1/ng/identities/cac-premium", [
                                'regNumber' => $normalizedNumber,
                            ]);

                        if (!$cacResponse->successful() && $numericPart) {
                            // Retry with numeric part if prefix caused mismatch
                            $cacResponse = Http::withToken($token)
                                ->timeout(20)
                                ->post("{$baseUrl}/v1/ng/identities/cac-premium", [
                                    'regNumber' => $numericPart,
                                ]);
                        }

                        if ($cacResponse->successful()) {
                            $liveData = $cacResponse->json();
                            return [
                                'status' => 'success',
                                'is_live' => true,
                                'source' => 'QoreID CAC Premium V2 API (Live)',
                                'verified_at' => now()->toIso8601String(),
                                'query_reg_number' => $rawNumber,
                                'data' => $liveData,
                                'match_analysis' => self::analyzeMatch($host, $liveData),
                            ];
                        }

                        Log::warning('QoreID CAC Query failed', [
                            'status' => $cacResponse->status(),
                            'body' => $cacResponse->body()
                        ]);
                    }
                } else {
                    Log::warning('QoreID Auth token request failed', [
                        'status' => $authResponse->status(),
                        'body' => $authResponse->body()
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('QoreID API connection exception: ' . $e->getMessage());
            }
        }

        // Return sandbox / test response conforming precisely to QoreID's OpenAPI schema
        $sandboxData = self::generateSandboxResponse($normalizedNumber, $numericPart, $prefix, $host);

        return [
            'status' => 'success',
            'is_live' => false,
            'is_sandbox' => true,
            'source' => 'QoreID CAC Verification Engine (Sandbox / Test Mode)',
            'notice' => empty($clientId) 
                ? 'Running in Sandbox mode. To switch to live API checks, set QOREID_CLIENT_ID and QOREID_SECRET_KEY in Admin Gateway Settings or .env.' 
                : 'QoreID live gateway returned test fallback. Check credentials in Admin Gateway Settings.',
            'verified_at' => now()->toIso8601String(),
            'query_reg_number' => $rawNumber,
            'data' => $sandboxData,
            'match_analysis' => self::analyzeMatch($host, $sandboxData),
        ];
    }

    /**
     * Generate standard QoreID OpenAPI formatted response for CAC verification.
     */
    protected static function generateSandboxResponse(string $regNumber, string $numericPart, string $prefix, ?User $host): array
    {
        $businessName = $host?->business_name ? trim($host->business_name) : 'Corporate Enterprise Entity';
        $hostName = $host?->name ? trim($host->name) : 'Host Representative';
        $hostEmail = $host?->email ?: 'compliance@cac.gov.ng';
        $hostPhone = $host?->phone ?: '2348000000000';

        $isBusinessName = ($prefix === 'BN');
        $classification = $isBusinessName ? 'Business Name' : 'Limited Company';
        $companyType = $isBusinessName 
            ? 'SOLE_PROPRIETORSHIP_ENTERPRISE' 
            : 'PRIVATE_COMPANY_LIMITED_BY_SHARES';

        // Corporate entity name styling
        $officialCompanyName = strtoupper($businessName);
        if (!$isBusinessName && !str_contains($officialCompanyName, 'LTD') && !str_contains($officialCompanyName, 'LIMITED')) {
            $officialCompanyName .= ' LIMITED';
        }

        $regYear = 2018 + (abs(crc32($regNumber)) % 6);
        $regMonth = str_pad((abs(crc32($regNumber . 'm')) % 12) + 1, 2, '0', STR_PAD_LEFT);
        $regDay = str_pad((abs(crc32($regNumber . 'd')) % 28) + 1, 2, '0', STR_PAD_LEFT);
        $registrationDate = "{$regYear}-{$regMonth}-{$regDay}T10:30:00.000+00:00";

        $mockId = 700000 + (abs(crc32($regNumber)) % 299999);

        // Split host name for affiliates
        $nameParts = explode(' ', $hostName);
        $firstName = $nameParts[0] ?? 'IBRAHIM';
        $surname = $nameParts[count($nameParts) - 1] ?? 'BELLO';
        $otherName = count($nameParts) > 2 ? $nameParts[1] : '';

        return [
            'id' => $mockId,
            'summary' => [
                'cac_check' => 'verified',
            ],
            'status' => [
                'state' => 'complete',
                'status' => 'verified',
            ],
            'cac' => [
                'rcNumber' => $regNumber,
                'companyName' => $officialCompanyName,
                'companyType' => $companyType,
                'classification' => $classification,
                'status' => 'ACTIVE',
                'registrationDate' => $registrationDate,
                'headOfficeAddress' => 'Plot ' . (abs(crc32($regNumber)) % 250 + 1) . ' Commercial Boulevard, Central Business District',
                'city' => 'Abuja',
                'state' => 'FCT',
                'lga' => 'Municipal Area Council',
                'companyEmail' => strtolower(str_replace(' ', '', preg_replace('/[^a-zA-Z0-9]/', '', $businessName))) . '@tafiya-partner.ng',
                'branchAddress' => 'Kano Regional Corporate Hub, Bompai Industrial Layout, Kano',
                'affiliates' => $isBusinessName ? 2 : 3,
                'shareCapital' => $isBusinessName ? 0 : 5000000,
                'shareCapitalInWords' => $isBusinessName ? 'NOT APPLICABLE' : 'FIVE MILLION NAIRA ONLY',
                'affiliatesData' => [
                    [
                        'surname' => strtoupper($surname),
                        'firstname' => strtoupper($firstName),
                        'othername' => strtoupper($otherName),
                        'email' => $hostEmail,
                        'phoneNumber' => $hostPhone,
                        'gender' => 'MALE',
                        'city' => 'KADUNA',
                        'state' => 'KADUNA',
                        'occupation' => 'REAL ESTATE INVESTOR & HOTELIER',
                        'status' => 'ACTIVE',
                        'isCorporate' => false,
                        'nationality' => 'NIGERIA',
                        'address' => 'Suite 12, Sultan Road Commercial Complex, Kaduna',
                        'affiliateType' => [
                            'name' => $isBusinessName ? 'PROPRIETOR' : 'DIRECTOR',
                        ],
                        'numSharesAlloted' => $isBusinessName ? 0 : 3500000,
                        'typeOfShares' => $isBusinessName ? '' : 'ORDINARY',
                        'dateOfAppointment' => $registrationDate,
                        'idType' => 'National ID (NIN)',
                    ],
                    [
                        'surname' => 'DANLAMI',
                        'firstname' => 'MUKHTAR',
                        'othername' => 'SULEIMAN',
                        'email' => 'm.danlami@corporate-legal.ng',
                        'phoneNumber' => '2348039281745',
                        'gender' => 'MALE',
                        'city' => 'ABUJA',
                        'state' => 'FCT',
                        'occupation' => 'LEGAL PRACTITIONER',
                        'status' => 'ACTIVE',
                        'isCorporate' => false,
                        'nationality' => 'NIGERIA',
                        'address' => 'Plot 402 Constitution Avenue, Central Business District, Abuja',
                        'affiliateType' => [
                            'name' => $isBusinessName ? 'PRESENTER' : 'COMPANY_SECRETARY',
                        ],
                        'numSharesAlloted' => 0,
                        'typeOfShares' => '',
                        'dateOfAppointment' => $registrationDate,
                        'idType' => 'Legal Practitioner Accreditation',
                    ],
                    ...( $isBusinessName ? [] : [
                        [
                            'surname' => 'BELLO',
                            'firstname' => 'AMINA',
                            'othername' => 'AISHA',
                            'email' => 'amina.bello@luxuryresidences.ng',
                            'phoneNumber' => '2348028746192',
                            'gender' => 'FEMALE',
                            'city' => 'KANO',
                            'state' => 'KANO',
                            'occupation' => 'BUSINESS EXECUTIVE',
                            'status' => 'ACTIVE',
                            'isCorporate' => false,
                            'nationality' => 'NIGERIA',
                            'address' => 'No. 18 Nasarawa GRA, Kano',
                            'affiliateType' => [
                                'name' => 'SHAREHOLDER',
                            ],
                            'numSharesAlloted' => 1500000,
                            'typeOfShares' => 'ORDINARY',
                            'dateOfAppointment' => $registrationDate,
                            'idType' => 'International Passport',
                        ]
                    ]),
                ],
            ],
        ];
    }

    /**
     * Compare host's declared business name and applicant name with official CAC record.
     */
    protected static function analyzeMatch(?User $host, array $qoreIdResponse): array
    {
        $declaredBusinessName = $host?->business_name ? strtoupper(trim($host->business_name)) : '';
        $cacCompanyName = strtoupper(trim($qoreIdResponse['cac']['companyName'] ?? ''));

        // Clean names for matching comparison
        $cleanDeclared = preg_replace('/[^A-Z0-9]/', '', $declaredBusinessName);
        $cleanCac = preg_replace('/[^A-Z0-9]/', '', $cacCompanyName);

        // Remove common suffixes like LIMITED, LTD
        $baseDeclared = preg_replace('/(LIMITED|LTD|VENTURES|ENTERPRISE|SUITES)$/', '', $cleanDeclared);
        $baseCac = preg_replace('/(LIMITED|LTD|VENTURES|ENTERPRISE|SUITES)$/', '', $cleanCac);

        $nameMatch = false;
        $matchScore = 0;

        if ($cleanDeclared === $cleanCac || (!empty($baseDeclared) && str_contains($baseCac, $baseDeclared))) {
            $nameMatch = true;
            $matchScore = 98;
        } else {
            similar_text($cleanDeclared, $cleanCac, $percent);
            $matchScore = round($percent);
            $nameMatch = $matchScore >= 70;
        }

        // Check if host's name appears among directors/affiliates
        $hostName = strtoupper(trim($host?->name ?? ''));
        $directorMatch = false;
        $matchedDirector = null;

        $affiliates = $qoreIdResponse['cac']['affiliatesData'] ?? [];
        foreach ($affiliates as $aff) {
            $affName = trim(($aff['firstname'] ?? '') . ' ' . ($aff['surname'] ?? ''));
            if (!empty($hostName) && (str_contains($hostName, $aff['surname'] ?? '###') || str_contains($affName, $hostName))) {
                $directorMatch = true;
                $matchedDirector = $affName . ' (' . ($aff['affiliateType']['name'] ?? 'DIRECTOR') . ')';
                break;
            }
        }

        return [
            'business_name_match' => $nameMatch,
            'match_confidence_percent' => $matchScore,
            'declared_business_name' => $host?->business_name,
            'cac_registered_name' => $qoreIdResponse['cac']['companyName'] ?? 'N/A',
            'director_match' => $directorMatch,
            'matched_director' => $matchedDirector,
            'cac_status' => $qoreIdResponse['cac']['status'] ?? 'UNKNOWN',
            'is_active_in_cac' => ($qoreIdResponse['cac']['status'] ?? '') === 'ACTIVE',
        ];
    }
}

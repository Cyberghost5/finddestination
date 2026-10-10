<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AgentWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'balance',
        'total_earned',
        'bank_name',
        'account_number',
        'account_name',
        'bank_code',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
    ];

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class, 'agent_wallet_id')->orderBy('created_at', 'desc');
    }

    public function withdrawals()
    {
        return $this->hasMany(WithdrawalRequest::class, 'agent_wallet_id')->orderBy('created_at', 'desc');
    }

    /**
     * Atomically credit inspection bounty to agent wallet
     */
    public function creditBounty(float $amount, string $reference, string $description): WalletTransaction
    {
        return DB::transaction(function () use ($amount, $reference, $description) {
            $this->balance = (float)$this->balance + $amount;
            $this->total_earned = (float)$this->total_earned + $amount;
            $this->save();

            return $this->transactions()->create([
                'type' => 'credit',
                'category' => 'inspection_bounty',
                'amount' => $amount,
                'balance_after' => $this->balance,
                'reference' => $reference,
                'description' => $description,
                'status' => 'completed',
            ]);
        });
    }

    /**
     * Atomically debit wallet for withdrawal request
     */
    public function debitForWithdrawal(float $amount, string $reference, string $description): WalletTransaction
    {
        if ((float)$this->balance < $amount) {
            throw new \Exception('Insufficient wallet balance.');
        }

        return DB::transaction(function () use ($amount, $reference, $description) {
            $this->balance = (float)$this->balance - $amount;
            $this->save();

            return $this->transactions()->create([
                'type' => 'debit',
                'category' => 'withdrawal',
                'amount' => $amount,
                'balance_after' => $this->balance,
                'reference' => $reference,
                'description' => $description,
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Refund withdrawal amount back into wallet upon admin decline
     */
    public function refundWithdrawal(float $amount, string $reference, string $reason): WalletTransaction
    {
        return DB::transaction(function () use ($amount, $reference, $reason) {
            $this->balance = (float)$this->balance + $amount;
            $this->save();

            return $this->transactions()->create([
                'type' => 'credit',
                'category' => 'refund',
                'amount' => $amount,
                'balance_after' => $this->balance,
                'reference' => $reference,
                'description' => $reason,
                'status' => 'completed',
            ]);
        });
    }
}

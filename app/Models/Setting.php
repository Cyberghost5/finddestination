<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    public static function getByKey(string $key, mixed $default = null)
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) return $default;

        $val = (string) $setting->value;
        if (str_starts_with($val, '[') || str_starts_with($val, '{')) {
            $decoded = json_decode($val, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }
        return $val;
    }

    public static function setByKey(string $key, mixed $value): static
    {
        $valToStore = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $valToStore]
        );
    }
}

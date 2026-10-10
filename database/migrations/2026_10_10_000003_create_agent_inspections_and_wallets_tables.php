<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update properties table with inspection fields
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'is_open_for_inspection')) {
                $table->boolean('is_open_for_inspection')->default(false)->after('is_published');
            }
            if (!Schema::hasColumn('properties', 'inspection_fee')) {
                $table->decimal('inspection_fee', 12, 2)->default(0.00)->after('is_open_for_inspection');
            }
            if (!Schema::hasColumn('properties', 'inspection_status')) {
                $table->enum('inspection_status', ['unassigned', 'application_pending', 'assigned', 'submitted', 'verified'])->default('unassigned')->after('inspection_fee');
            }
        });

        // 2. Create agent_inspections table
        Schema::create('agent_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'declined', 'submitted', 'verified'])->default('pending');
            $table->decimal('inspection_fee', 12, 2)->default(0.00);
            $table->timestamp('applied_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->decimal('gps_latitude', 10, 8)->nullable();
            $table->decimal('gps_longitude', 11, 8)->nullable();
            $table->json('photos')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->json('amenities_check')->nullable();
            $table->text('report_notes')->nullable();
            $table->text('admin_review_notes')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'agent_id', 'status']);
        });

        // 3. Create agent_wallets table
        Schema::create('agent_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->unique()->constrained('users')->onDelete('cascade');
            $table->decimal('balance', 12, 2)->default(0.00);
            $table->decimal('total_earned', 12, 2)->default(0.00);
            $table->string('bank_name', 150)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('account_name', 150)->nullable();
            $table->string('bank_code', 50)->nullable();
            $table->timestamps();
        });

        // 4. Create wallet_transactions table
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_wallet_id')->constrained('agent_wallets')->onDelete('cascade');
            $table->enum('type', ['credit', 'debit']);
            $table->enum('category', ['inspection_bounty', 'withdrawal', 'refund', 'adjustment']);
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->string('reference', 100)->unique();
            $table->text('description')->nullable();
            $table->enum('status', ['completed', 'pending', 'failed'])->default('completed');
            $table->timestamps();

            $table->index(['agent_wallet_id', 'type', 'category']);
        });

        // 5. Create withdrawal_requests table
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_wallet_id')->constrained('agent_wallets')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('bank_name', 150);
            $table->string('account_number', 50);
            $table->string('account_name', 150);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('processed_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->string('transaction_reference', 100)->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('agent_wallets');
        Schema::dropIfExists('agent_inspections');

        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'is_open_for_inspection')) {
                $table->dropColumn('is_open_for_inspection');
            }
            if (Schema::hasColumn('properties', 'inspection_fee')) {
                $table->dropColumn('inspection_fee');
            }
            if (Schema::hasColumn('properties', 'inspection_status')) {
                $table->dropColumn('inspection_status');
            }
        });
    }
};

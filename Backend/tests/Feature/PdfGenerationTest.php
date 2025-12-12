<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class PdfGenerationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer les rôles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'landlord']);
        Role::firstOrCreate(['name' => 'tenant']);
    }

    /** @test */
    public function can_generate_invoice_pdf(): void
    {
        // Créer les données de test
        $landlord = Landlord::factory()->create();
        $landlordUser = User::factory()->create();
        $landlordUser->assignRole('landlord');
        $landlord->user()->associate($landlordUser)->save();

        $tenant = Tenant::factory()->create();
        $tenantUser = User::factory()->create();
        $tenantUser->assignRole('tenant');
        $tenant->user()->associate($tenantUser)->save();

        $property = Property::factory()->create([
            'landlord_id' => $landlord->id
        ]);

        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);

        $invoice = Invoice::factory()->create([
            'lease_id' => $lease->id,
            'status' => 'paid'
        ]);

        // Tester la génération de PDF
        $pdfService = new PdfService();
        $tempPath = $pdfService->generateInvoicePdf($invoice, 'quittance');

        $this->assertNotNull($tempPath);
        $this->assertStringContainsString('quittance', $tempPath);
    }

    /** @test */
    public function can_generate_lease_contract_pdf(): void
    {
        // Créer les données de test
        $landlord = Landlord::factory()->create();
        $landlordUser = User::factory()->create();
        $landlordUser->assignRole('landlord');
        $landlord->user()->associate($landlordUser)->save();

        $tenant = Tenant::factory()->create();
        $tenantUser = User::factory()->create();
        $tenantUser->assignRole('tenant');
        $tenant->user()->associate($tenantUser)->save();

        $property = Property::factory()->create([
            'landlord_id' => $landlord->id
        ]);

        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);

        // Tester la génération de contrat de bail
        $pdfService = new PdfService();
        $tempPath = $pdfService->generateLeaseContractPdf($lease);

        $this->assertNotNull($tempPath);
        $this->assertStringContainsString('Contrat_Bail', $tempPath);
    }

    /** @test */
    public function pdf_generation_handles_missing_data_gracefully(): void
    {
        $invoice = Invoice::factory()->create();
        
        $pdfService = new PdfService();
        
        // Cela ne devrait pas planter même si les relations ne sont pas chargées
        $tempPath = $pdfService->generateInvoicePdf($invoice, 'quittance');
        
        $this->assertNotNull($tempPath);
    }

    /** @test */
    public function can_generate_avis_echeance_pdf(): void
    {
        // Créer les données de test
        $landlord = Landlord::factory()->create();
        $landlordUser = User::factory()->create();
        $landlordUser->assignRole('landlord');
        $landlord->user()->associate($landlordUser)->save();

        $tenant = Tenant::factory()->create();
        $tenantUser = User::factory()->create();
        $tenantUser->assignRole('tenant');
        $tenant->user()->associate($tenantUser)->save();

        $property = Property::factory()->create([
            'landlord_id' => $landlord->id
        ]);

        $lease = Lease::factory()->create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id
        ]);

        $invoice = Invoice::factory()->create([
            'lease_id' => $lease->id,
            'status' => 'pending'
        ]);

        // Tester la génération d'avis d'échéance
        $pdfService = new PdfService();
        $tempPath = $pdfService->generateInvoicePdf($invoice, 'avis_echeance');

        $this->assertNotNull($tempPath);
        $this->assertStringContainsString('avis_echeance', $tempPath);
    }

    /** @test */
    public function pdf_filename_includes_correct_data(): void
    {
        $invoice = Invoice::factory()->create([
            'invoice_number' => 'FACT-2024-001'
        ]);

        $pdfService = new PdfService();
        $tempPath = $pdfService->generateInvoicePdf($invoice, 'quittance');

        $this->assertStringContainsString('FACT-2024-001', $tempPath);
        $this->assertStringContainsString(date('Y-m-d'), $tempPath);
    }

    /** @test */
    public function can_cleanup_temp_files(): void
    {
        $invoice = Invoice::factory()->create();
        
        $pdfService = new PdfService();
        $tempPath = $pdfService->generateInvoicePdf($invoice, 'quittance');
        
        // Vérifier que le fichier existe
        $this->assertTrue(\Illuminate\Support\Facades\Storage::exists($tempPath));
        
        // Nettoyer les fichiers temporaires
        $pdfService->cleanupTempFiles([$tempPath]);
        
        // Vérifier que le fichier a été supprimé
        $this->assertFalse(\Illuminate\Support\Facades\Storage::exists($tempPath));
    }
}

@extends('layouts.co-owner')

@section('title', 'Détails du paiement')

@section('content')
    <div class="payment-detail">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <h1>Détails du paiement</h1>
                <p class="subtitle">Consultez les informations complètes du paiement</p>
            </div>
            <div class="header-actions">
                <a href="{{ route('co-owner.payments.index') }}" class="btn-outline">
                    <span class="icon">←</span>
                    Retour à la liste
                </a>
                @if ($payment->status === 'approved')
                    <button
                        onclick="showSendReceiptModal({{ $payment->id }}, '{{ $payment->lease->tenant->user->full_name ?? ($payment->lease->tenant->user->name ?? 'Locataire') }}', '{{ $payment->lease->tenant->user->email ?? '' }}')"
                        class="btn-primary" style="background-color: #70AE48;">
                        <span class="icon">✉️</span>
                        Envoyer la quittance
                    </button>
                    <a href="{{ route('co-owner.payments.receipt', $payment->id) }}" class="btn-secondary" target="_blank">
                        <span class="icon">📄</span>
                        Télécharger PDF
                    </a>
                @endif
            </div>
        </div>

        <!-- Statut Banner -->
        <div
            class="status-banner {{ $payment->status === 'approved' ? 'success' : ($payment->status === 'pending' ? 'warning' : 'danger') }}">
            <div class="status-icon">
                @if ($payment->status === 'approved')
                    ✓
                @elseif(in_array($payment->status, ['pending', 'initiated']))
                    ⏳
                @else
                    ⚠
                @endif
            </div>
            <div class="status-content">
                <h3>Paiement
                    {{ $payment->status === 'approved' ? 'confirmé' : ($payment->status === 'pending' ? 'en attente' : 'annulé') }}
                </h3>
                <p>ID de transaction: #{{ $payment->id }}</p>
            </div>
        </div>

        <!-- Informations principales -->
        <div class="detail-grid">
            <!-- Colonne gauche : Informations paiement -->
            <div class="detail-card">
                <h2>Informations du paiement</h2>
                <div class="detail-list">
                    <div class="detail-item">
                        <span class="label">Montant total</span>
                        <span class="value amount">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Frais (5%)</span>
                        <span class="value">{{ number_format($payment->fee_amount, 0, ',', ' ') }} FCFA</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Montant net</span>
                        <span class="value">{{ number_format($payment->amount_net, 0, ',', ' ') }} FCFA</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Devise</span>
                        <span class="value">{{ $payment->currency }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Date de paiement</span>
                        <span class="value">{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y') : '-' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Mode de paiement</span>
                        <span class="value">
                            @php
                                $method = $payment->provider_payload
                                    ? json_decode($payment->provider_payload)->payment_method ?? 'manual'
                                    : 'manual';
                                $methodLabel = match ($method) {
                                    'virement' => 'Virement bancaire',
                                    'cheque' => 'Chèque',
                                    'especes' => 'Espèces',
                                    'mobile_money' => 'Mobile Money',
                                    'card' => 'Carte bancaire',
                                    default => 'Virement bancaire',
                                };
                            @endphp
                            {{ $methodLabel }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Date d'enregistrement</span>
                        <span class="value">{{ $payment->created_at->format('d/m/Y H:i') }}</span>
                    </div>
                </div>
            </div>

            <!-- Colonne droite : Informations locataire et bien -->
            <div class="detail-card">
                <h2>Locataire</h2>
                <div class="tenant-info">
                    <div class="tenant-avatar" style="background: #70AE48;">
                        {{ substr($payment->lease->tenant->first_name ?? 'N', 0, 1) }}
                        {{ substr($payment->lease->tenant->last_name ?? 'A', 0, 1) }}
                    </div>

                    <div class="tenant-details">
                        <h3>
                            {{ trim(($payment->lease->tenant->first_name ?? '') . ' ' . ($payment->lease->tenant->last_name ?? '')) ?: 'Non renseigné' }}
                        </h3>

                        <p>{{ $payment->lease->tenant->user->email ?? 'Email non renseigné' }}</p>
                        <p>{{ $payment->lease->tenant->user->phone ?? 'Téléphone non renseigné' }}</p>
                    </div>
                </div>

                <h2 class="mt-4">Bien immobilier</h2>
                <div class="property-info">
                    <h3>{{ $payment->lease->property->name ?? 'Non renseigné' }}</h3>
                    <p class="address">{{ $payment->lease->property->address ?? 'Adresse non renseignée' }}</p>
                    @if ($payment->lease->property->city)
                        <p class="city">{{ $payment->lease->property->city }}</p>
                    @endif
                </div>

                <h2 class="mt-4">Bail</h2>
                <div class="lease-info">
                    <p><strong>Référence:</strong> #{{ $payment->lease->id }}</p>
                    <p><strong>Début:</strong>
                        {{ $payment->lease->start_date ? $payment->lease->start_date->format('d/m/Y') : '-' }}</p>
                    <p><strong>Fin:</strong>
                        {{ $payment->lease->end_date ? $payment->lease->end_date->format('d/m/Y') : '-' }}</p>
                    <p><strong>Loyer mensuel:</strong> {{ number_format($payment->lease->rent_amount, 0, ',', ' ') }} FCFA
                    </p>
                </div>
            </div>
        </div>

        <!-- Notes additionnelles -->
        @if ($payment->provider_payload && json_decode($payment->provider_payload)->notes)
            <div class="notes-card">
                <h2>Notes</h2>
                <div class="notes-content">
                    {{ json_decode($payment->provider_payload)->notes }}
                </div>
                <div class="notes-meta">
                    Enregistré par {{ $payment->landlord->name ?? 'Utilisateur' }} le
                    {{ $payment->created_at->format('d/m/Y à H:i') }}
                </div>
            </div>
        @endif

        <!-- Actions supplémentaires -->
        <div class="actions-footer">
            <div class="left">
                @if ($payment->status === 'approved')
                    <button onclick="showArchiveModal({{ $payment->id }})" class="btn-outline-danger">
                        <span class="icon">📁</span>
                        Archiver
                    </button>
                @endif
            </div>
            <div class="right">
                <a href="mailto:{{ $payment->lease->tenant->user->email ?? '' }}" class="btn-secondary">
                    <span class="icon">✉️</span>
                    Contacter le locataire
                </a>
            </div>
        </div>
    </div>

    <!-- MODALE DE CONFIRMATION D'ENVOI DE QUITTANCE -->
    <div id="sendReceiptModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-icon email-icon">✉️</div>
                <h2>Envoyer la quittance</h2>
                <button class="modal-close" onclick="closeModal('sendReceiptModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-info">
                    <div class="info-row">
                        <span class="info-label">Locataire :</span>
                        <span class="info-value" id="receipt-tenant-name"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email :</span>
                        <span class="info-value" id="receipt-tenant-email"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Document :</span>
                        <span class="info-value">Quittance de loyer (PDF)</span>
                    </div>
                </div>
                <div class="modal-message">
                    <p>Vous allez envoyer la quittance de loyer par email au locataire.</p>
                    <p class="small">Un accusé de réception sera envoyé une fois le mail délivré.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal('sendReceiptModal')">Annuler</button>
                <button class="btn-confirm" id="confirmSendReceiptBtn" onclick="confirmSendReceipt()">
                    <span class="btn-icon">✉️</span>
                    Envoyer la quittance
                </button>
            </div>
        </div>
    </div>

    <!-- MODALE DE CONFIRMATION D'ARCHIVAGE -->
    <div id="archiveModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-icon archive-icon">📁</div>
                <h2>Archiver le paiement</h2>
                <button class="modal-close" onclick="closeModal('archiveModal')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-info">
                    <div class="info-row">
                        <span class="info-label">Paiement :</span>
                        <span class="info-value">#{{ $payment->id }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Montant :</span>
                        <span class="info-value">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Locataire :</span>
                        <span
                            class="info-value">{{ $payment->lease->tenant->user->full_name ?? ($payment->lease->tenant->user->name ?? 'N/A') }}</span>
                    </div>
                </div>
                <div class="modal-message warning-message">
                    <span class="warning-icon">⚠️</span>
                    <p>Cette action déplacera ce paiement dans les archives. Vous pourrez toujours le consulter
                        ultérieurement.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal('archiveModal')">Annuler</button>
                <form id="archiveForm" action="{{ route('co-owner.payments.archive', $payment->id) }}" method="POST"
                    style="display: inline;">
                    @csrf
                    @method('PUT')
                    <button type="submit" class="btn-confirm" style="background: #dc3545;" id="confirmArchiveBtn">
                        <span class="btn-icon">📁</span>
                        Confirmer l'archivage
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div id="toast" class="toast">
        <div class="toast-icon" id="toast-icon">✅</div>
        <div class="toast-content">
            <div class="toast-title" id="toast-title">Succès</div>
            <div class="toast-message" id="toast-message">Action effectuée avec succès</div>
        </div>
        <button class="toast-close" onclick="closeToast()">&times;</button>
    </div>

    <!-- OVERLAY -->
    <div id="overlay" class="overlay" onclick="closeAllModals()"></div>

    <style>
        .payment-detail {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .header-left h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #666;
            font-size: 1rem;
        }

        .header-actions {
            display: flex;
            gap: 1rem;
        }

        .btn-primary,
        .btn-secondary,
        .btn-outline {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #70AE48;
            color: white;
            border: none;
        }

        .btn-primary:hover {
            background: #70AE48;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 125, 218, 0.3);
        }

        .btn-secondary {
            background: white;
            color: #333;
            border: 1px solid #0b7dda;
        }

        .btn-secondary:hover {
            background: #e6f0fa;
            transform: translateY(-2px);
        }

        .btn-outline {
            background: white;
            color: #666;
            border: 1px solid #e0e0e0;
        }

        .btn-outline:hover {
            background: #f5f5f5;
            border-color: #999;
        }

        .btn-outline-danger {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: white;
            color: #dc3545;
            border: 1px solid #dc3545;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-outline-danger:hover {
            background: #dc3545;
            color: white;
        }

        .status-banner {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }

        .status-banner.success {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
        }

        .status-banner.warning {
            background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
            color: white;
        }

        .status-banner.danger {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
        }

        .status-icon {
            font-size: 2.5rem;
        }

        .status-content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .detail-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            padding: 1.5rem;
        }

        .detail-card h2 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #f0f0f0;
        }

        .detail-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
        }

        .detail-item .label {
            color: #666;
            font-size: 0.95rem;
        }

        .detail-item .value {
            font-weight: 600;
            color: #1a1a1a;
        }

        .detail-item .value.amount {
            font-size: 1.2rem;
            color: #0b7dda;
        }

        .tenant-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
        }

        .tenant-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #0b7dda;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 600;
        }

        .tenant-details h3 {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .tenant-details p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.15rem;
        }

        .property-info,
        .lease-info {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
        }

        .property-info h3 {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #0b7dda;
        }

        .address {
            color: #666;
            margin-bottom: 0.25rem;
        }

        .notes-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .notes-card h2 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .notes-content {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 12px;
            font-style: italic;
            color: #333;
            margin-bottom: 1rem;
        }

        .notes-meta {
            color: #999;
            font-size: 0.85rem;
        }

        .actions-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid #e0e0e0;
        }

        .mt-4 {
            margin-top: 1.5rem;
        }

        /* MODAL STYLES */
        .overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            z-index: 999;
            animation: fadeIn 0.3s ease;
        }

        .modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }

        .modal-content {
            display: flex;
            flex-direction: column;
        }

        .modal-header {
            display: flex;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e0e0e0;
            position: relative;
        }

        .modal-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-right: 1rem;
        }

        .modal-icon.email-icon {
            background: #e3f2fd;
            color: #0b7dda;
        }

        .modal-icon.archive-icon {
            background: #ffebcc;
            color: #FF9800;
        }

        .modal-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            margin: 0;
        }

        .modal-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .modal-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .modal-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .info-row {
            display: flex;
            margin-bottom: 0.75rem;
        }

        .info-row:last-child {
            margin-bottom: 0;
        }

        .info-label {
            width: 100px;
            color: #666;
            font-size: 0.9rem;
        }

        .info-value {
            flex: 1;
            color: #333;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .modal-message {
            padding: 0.5rem 0;
        }

        .modal-message p {
            color: #666;
            margin-bottom: 0.5rem;
            line-height: 1.5;
        }

        .modal-message p.small {
            font-size: 0.85rem;
            color: #999;
        }

        .modal-message.warning-message {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
            background: #fff3e0;
            border-radius: 8px;
            border-left: 4px solid #FF9800;
        }

        .warning-icon {
            font-size: 1.25rem;
            color: #FF9800;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding: 1.5rem;
            border-top: 1px solid #e0e0e0;
        }

        .btn-cancel {
            padding: 0.75rem 1.5rem;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            color: #666;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-cancel:hover {
            background: #f5f5f5;
            border-color: #999;
        }

        .btn-confirm {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #70AE48;
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-confirm:hover {
            background: #70AE48;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 125, 218, 0.3);
        }

        .btn-icon {
            font-size: 1.1rem;
        }

        /* TOAST NOTIFICATION */
        .toast {
            display: none;
            position: fixed;
            top: 30px;
            right: 30px;
            width: 350px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            padding: 1.25rem;
            align-items: flex-start;
            gap: 1rem;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid;
        }

        .toast.success {
            border-left-color: #4CAF50;
        }

        .toast.error {
            border-left-color: #f44336;
        }

        .toast.warning {
            border-left-color: #FF9800;
        }

        .toast.info {
            border-left-color: #0b7dda;
        }

        .toast-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }

        .toast-content {
            flex: 1;
        }

        .toast-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
        }

        .toast-message {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }

        .toast-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 1.25rem;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .toast-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        /* ANIMATIONS */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -60%);
            }

            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @media (max-width: 768px) {
            .payment-detail {
                padding: 1rem;
            }

            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }

            .header-actions {
                width: 100%;
                flex-direction: column;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .status-banner {
                flex-direction: column;
                text-align: center;
            }

            .toast {
                top: 20px;
                right: 20px;
                left: 20px;
                width: auto;
            }
        }
    </style>

    <script>
        // VARIABLES GLOBALES
        let currentPaymentId = null;
        let toastTimeout = null;

        // FONCTIONS DE MODALE
        function showSendReceiptModal(paymentId, tenantName, tenantEmail) {
            currentPaymentId = paymentId;
            document.getElementById('receipt-tenant-name').textContent = tenantName;
            document.getElementById('receipt-tenant-email').textContent = tenantEmail;
            openModal('sendReceiptModal');
        }

        function showArchiveModal(paymentId) {
            openModal('archiveModal');
        }

        function openModal(modalId) {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById(modalId).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById(modalId).style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        function closeAllModals() {
            document.getElementById('overlay').style.display = 'none';
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }

        // FONCTION D'ENVOI DE QUITTANCE
        function confirmSendReceipt() {
            if (!currentPaymentId) return;

            const confirmBtn = document.getElementById('confirmSendReceiptBtn');
            const originalText = confirmBtn.innerHTML;

            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="btn-icon">⏳</span> Envoi en cours...';

            fetch(`/coproprietaire/paiements/${currentPaymentId}/send-receipt`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    closeModal('sendReceiptModal');

                    if (data.success) {
                        showToast('success', 'Quittance envoyée', data.success);
                    } else if (data.error) {
                        showToast('error', 'Erreur', data.error);
                    }
                })
                .catch(error => {
                    closeModal('sendReceiptModal');
                    showToast('error', 'Erreur', 'Erreur lors de l\'envoi de la quittance');
                    console.error(error);
                })
                .finally(() => {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = originalText;
                    currentPaymentId = null;
                });
        }

        // FONCTION DE TOAST
        function showToast(type, title, message) {
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }

            const toast = document.getElementById('toast');

            toast.className = 'toast ' + type;
            document.getElementById('toast-title').textContent = title;
            document.getElementById('toast-message').textContent = message;

            const iconMap = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            document.getElementById('toast-icon').textContent = iconMap[type] || '✅';

            toast.style.display = 'flex';

            toastTimeout = setTimeout(() => {
                closeToast();
            }, 5000);
        }

        function closeToast() {
            const toast = document.getElementById('toast');
            toast.style.display = 'none';
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
        }

        // INITIALISATION
        document.addEventListener('DOMContentLoaded', function() {
            @if (session('success'))
                showToast('success', 'Succès', '{{ session('success') }}');
                @php session()->forget('success'); @endphp
            @endif

            @if (session('error'))
                showToast('error', 'Erreur', '{{ session('error') }}');
                @php session()->forget('error'); @endphp
            @endif

            @if (session('warning'))
                showToast('warning', 'Attention', '{{ session('warning') }}');
                @php session()->forget('warning'); @endphp
            @endif

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeAllModals();
                    closeToast();
                }
            });
        });
    </script>
@endsection

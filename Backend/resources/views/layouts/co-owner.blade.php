<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Co-propriétaire')</title>
    <link rel="shortcut icon" href="{{ asset('images/logo.webp') }}" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary: #70AE48;
            --primary-dark: #5c8f3a;
            --primary-light: #f0f9e6;
            --primary-soft: rgba(112, 174, 72, 0.08);
            --text-green: #529D21;
            --gradient-green: linear-gradient(94.5deg, #8CCC63 5.47%, rgba(82, 157, 33, 0.87) 91.93%);
            --red: #ef4444;
            --red-light: #fee2e2;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --amber: #f59e0b;
            --amber-light: #fef3c7;
            --shadow: 0 22px 70px rgba(0, 0, 0, .18);
            --sidebar-shadow: 0px 0px 20px rgba(0,0,0,0.05), 0px 5px 25px rgba(112, 174, 72, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Merriweather', serif;
            min-height: 100vh;
            background: #fff;
            overflow: hidden;
        }

        /* ─── HEADER ─── */
        .header {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 100;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 3rem;
            background: var(--gradient-green);
        }

        .header-left { display: flex; align-items: center; gap: 0.75rem; }

        .header-logo {
            font-family: 'Merriweather', serif;
            font-weight: 900;
            font-size: 1.85rem;
            color: #fff;
            letter-spacing: -0.01em;
        }

        .header-right { display: flex; align-items: center; gap: 1rem; }

        .header-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.5rem;
            border-radius: 9999px;
            background: rgba(255,255,255,0.4);
            border: none;
            color: white;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Merriweather', serif;
            backdrop-filter: blur(8px);
            transition: background 0.2s;
            position: relative;
        }

        .header-btn:hover { background: rgba(255,255,255,0.55); }

        .header-btn svg { flex-shrink: 0; }

        .notif-badge {
            position: absolute;
            top: -4px; right: -4px;
            width: 20px; height: 20px;
            background: #f87171;
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 9999px;
            display: flex; align-items: center; justify-content: center;
            border: 2px solid #8CCC63;
        }

        .mobile-menu-btn {
            display: none;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
        }

        /* ─── LAYOUT ─── */
        .app-body {
            display: flex;
            height: calc(100vh - 72px);
            margin-top: 72px;
            background: white;
            position: relative;
        }

        /* ─── SIDEBAR ─── */
        .sidebar {
            position: fixed;
            left: 30px;
            top: 100px;
            width: 310px;
            max-height: calc(100vh - 140px);
            background: white;
            border-radius: 24px;
            box-shadow: var(--sidebar-shadow);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 120;
            transition: transform 0.3s ease;
        }

        .sidebar-scroll {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem 0.75rem;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .sidebar-scroll::-webkit-scrollbar { display: none; }

        /* ─── MENU GROUPS ─── */
        .menu-group { margin-bottom: 1rem; }

        .menu-group-title {
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            color: #BDBDBD;
            padding: 1.2rem 1.4rem 0.6rem;
            text-transform: uppercase;
            font-family: 'Merriweather', serif;
            line-height: 100%;
        }

        /* ─── MENU ITEMS ─── */
        .menu-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            margin-bottom: 2px;
            border: none;
            background: transparent;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Merriweather', serif;
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--gray-500);
            text-align: left;
            position: relative;
        }

        .menu-item:hover {
            color: var(--text-green);
        }

        .menu-item:hover .menu-icon { opacity: 1; transform: scale(1.1); }

        .menu-item.active {
            background: linear-gradient(90deg, rgba(255, 213, 124, 0.87) 0%, #FFFFFF 100%);
            color: var(--text-green);
        }

        .menu-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 5px;
            height: 30px;
            background: #FFB300;
            border-radius: 0 9999px 9999px 0;
            box-shadow: 0px 0px 10px rgba(255, 179, 0, 0.4);
        }

        .menu-item.active .menu-icon { opacity: 1; transform: scale(1.1); }

        .menu-icon {
            opacity: 0.6;
            transition: all 0.3s;
            flex-shrink: 0;
        }

        .menu-item-chevron {
            margin-left: auto;
            flex-shrink: 0;
        }

        /* ─── SIDEBAR FOOTER ─── */
        .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid var(--gray-200);
            background: white;
            flex-shrink: 0;
        }

        .user-profile { display: flex; align-items: center; gap: 0.75rem; }

        .user-avatar {
            width: 2.5rem; height: 2.5rem;
            border-radius: 9999px;
            background: linear-gradient(to right, #70AE48, #8BC34A);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 0.875rem; font-weight: 700;
            flex-shrink: 0;
            font-family: 'Merriweather', serif;
        }

        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 0.875rem; font-weight: 700; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 0.75rem; color: var(--gray-500); }

        /* ─── MAIN CONTENT ─── */
        .main-content {
            flex: 1;
            margin-left: 390px;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            background: white;
            scrollbar-width: none;
        }
        .main-content::-webkit-scrollbar { display: none; }

        .main-inner {
            padding: 3rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* ─── OVERLAY MOBILE ─── */
        .overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
            display: none;
        }
        .overlay.active { display: block; }

        /* ─── MODALES ─── */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
            opacity: 0; visibility: hidden;
            transition: all 0.3s ease;
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }

        .modal-container {
            background: white;
            border-radius: 1.5rem;
            width: 90%; max-width: 500px; max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: var(--shadow);
        }
        .modal-overlay.active .modal-container { transform: scale(1); }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex; align-items: center; justify-content: space-between;
            background: linear-gradient(135deg, var(--primary-light), white);
            border-radius: 1.5rem 1.5rem 0 0;
        }

        .modal-header h2 {
            font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
            display: flex; align-items: center; gap: 0.5rem;
            font-family: 'Merriweather', serif;
        }

        .modal-close {
            width: 2rem; height: 2rem; border-radius: 50%;
            background: var(--gray-100);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s; border: none; color: var(--gray-500);
        }
        .modal-close:hover { background: var(--gray-200); color: var(--gray-700); }

        .modal-body { padding: 1.5rem; }

        /* ─── NOTIFICATIONS ─── */
        .notification-item {
            display: flex; align-items: flex-start; gap: 1rem;
            padding: 1rem; border-bottom: 1px solid var(--gray-200);
            transition: all 0.2s; cursor: pointer;
        }
        .notification-item:hover { background: var(--gray-50); }
        .notification-item.unread { background: var(--primary-soft); }

        .notification-icon {
            width: 2.5rem; height: 2.5rem; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .notification-icon.payment { background: #dbeafe; color: #2563eb; }
        .notification-icon.tenant { background: #dcfce7; color: #16a34a; }
        .notification-icon.alert { background: #fee2e2; color: #dc2626; }
        .notification-icon.info { background: #f3e8ff; color: #9333ea; }

        .notification-content { flex: 1; }
        .notification-title { font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem; font-size: 0.875rem; font-family: 'Merriweather', serif; }
        .notification-message { font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.25rem; }
        .notification-time { font-size: 0.75rem; color: var(--gray-500); }
        .notification-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-left: 0.5rem; flex-shrink: 0; margin-top: 4px; }

        .notification-footer { padding: 1rem; text-align: center; border-top: 1px solid var(--gray-200); }
        .notification-footer button { background: none; border: none; color: var(--primary); font-weight: 700; font-size: 0.875rem; cursor: pointer; font-family: 'Merriweather', serif; }
        .notification-footer button:hover { text-decoration: underline; }

        .empty-notifications { text-align: center; padding: 3rem 1rem; color: var(--gray-500); }
        .empty-notifications svg { width: 4rem; height: 4rem; color: var(--gray-400); margin: 0 auto 1rem; display: block; }

        /* ─── AIDE ─── */
        .help-search { margin-bottom: 1.5rem; }
        .help-search input {
            width: 100%; padding: 0.875rem 1rem;
            border: 2px solid var(--gray-300); border-radius: 1rem;
            font-size: 0.95rem; font-family: 'Merriweather', serif;
            transition: all 0.2s;
        }
        .help-search input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }

        .help-faq-item { padding: 1rem; border-bottom: 1px solid var(--gray-200); cursor: pointer; }
        .help-faq-item:hover { background: var(--gray-50); }
        .help-faq-question { font-weight: 700; color: var(--gray-900); display: flex; align-items: center; justify-content: space-between; font-family: 'Merriweather', serif; font-size: 0.9rem; }
        .help-faq-answer { margin-top: 0.5rem; color: var(--gray-600); font-size: 0.875rem; display: none; }
        .help-faq-answer.expanded { display: block; }

        .help-contact { margin-top: 1.5rem; padding: 1.5rem; background: linear-gradient(135deg, var(--primary-light), white); border-radius: 1rem; border: 2px solid rgba(112,174,72,0.2); text-align: center; }
        .help-contact p { color: var(--gray-700); margin-bottom: 1rem; font-family: 'Merriweather', serif; }
        .help-contact-buttons { display: flex; gap: 1rem; justify-content: center; }
        .help-contact-btn { padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Merriweather', serif; }
        .help-contact-btn.primary { background: var(--primary); color: white; }
        .help-contact-btn.primary:hover { background: var(--primary-dark); }
        .help-contact-btn.secondary { background: white; border: 2px solid var(--primary); color: var(--primary); }
        .help-contact-btn.secondary:hover { background: var(--primary-light); }

        /* ─── LOGOUT MODAL ─── */
        .logout-modal-icon {
            width: 5rem; height: 5rem; border-radius: 50%;
            margin: 0 auto 1.5rem;
            display: flex; align-items: center; justify-content: center;
            background: var(--amber-light); color: var(--amber);
            border: 3px solid var(--amber);
        }
        .logout-modal-title { font-size: 1.5rem; font-weight: 900; color: var(--gray-900); text-align: center; margin-bottom: 0.5rem; font-family: 'Merriweather', serif; }
        .logout-modal-message { color: var(--gray-600); text-align: center; margin-bottom: 1.5rem; font-family: 'Merriweather', serif; }
        .logout-modal-actions { display: flex; gap: 1rem; justify-content: center; }
        .logout-modal-btn { padding: 0.875rem 2rem; border-radius: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; min-width: 140px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: 'Merriweather', serif; }
        .logout-modal-btn-primary { background: var(--amber); color: white; }
        .logout-modal-btn-primary:hover { background: #d97706; transform: translateY(-2px); }
        .logout-modal-btn-secondary { background: var(--gray-100); color: var(--gray-700); border: 2px solid var(--gray-300); }
        .logout-modal-btn-secondary:hover { background: var(--gray-200); }

        /* ─── FORM UTILITIES (inchangées) ─── */
        .form-container { min-height: 100vh; background: #fff; padding: 2rem; position: relative; }
        .form-card { max-width: 1200px; margin: 0 auto; background: rgba(255,255,255,.92); border-radius: 22px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid rgba(112,174,72,.18); }
        .form-header { background: linear-gradient(135deg, #70AE48, #8BC34A); padding: 2.5rem; color: white; }
        .form-body { padding: 2.5rem; }
        .section { margin-bottom: 2.5rem; background: rgba(255,255,255,.72); padding: 2rem; border-radius: 16px; border: 1px solid rgba(17,24,39,.08); box-shadow: 0 10px 30px rgba(17,24,39,.06); }
        .form-grid { display: grid; gap: 1.25rem; }
        .form-grid-2 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.85rem; font-weight: 900; color: #334155; display: flex; align-items: center; gap: 0.35rem; font-family: 'Merriweather', serif; }
        .required { color: #e11d48; }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 0.85rem 1rem; border: 2px solid rgba(148,163,184,.35); border-radius: 12px; font-size: 1rem; color: #0f172a; background: rgba(255,255,255,.92); transition: all 0.2s; font-family: 'Merriweather', serif; font-weight: 700; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: rgba(112,174,72,.75); box-shadow: 0 0 0 4px rgba(112,174,72,0.14); }
        .button { padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Merriweather', serif; white-space: nowrap; text-decoration: none; }
        .button-primary { background: linear-gradient(135deg, #70AE48, #8BC34A); color: #fff; box-shadow: 0 14px 30px rgba(112,174,72,.22); }
        .button-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 18px 34px rgba(112,174,72,.28); }
        .button-secondary { background: rgba(255,255,255,.92); color: #70AE48; border: 2px solid rgba(112,174,72,.20); }
        .button-danger { background: rgba(255,255,255,.92); color: #e11d48; border: 2px solid rgba(225,29,72,.18); }
        .top-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .top-actions-right { display: flex; gap: .75rem; flex-wrap: wrap; }
        .bottom-actions { display: flex; justify-content: flex-end; gap: .75rem; padding-top: 1.5rem; border-top: 2px solid rgba(148,163,184,.35); flex-wrap: wrap; }
        .alert-box { border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid; font-weight: 850; display: flex; align-items: flex-start; gap: 10px; font-family: 'Merriweather', serif; }
        .alert-info { background: rgba(240,249,235,.92); border-color: rgba(112,174,72,.30); color: #2e5e1e; }
        .alert-warning { background: rgba(254,252,232,.92); border-color: rgba(245,158,11,.30); color: #92400e; }
        .alert-error { background: rgba(254,242,242,.92); border-color: rgba(248,113,113,.30); color: #991b1b; }
        .alert-success { background: rgba(240,253,244,.92); border-color: rgba(74,222,128,.30); color: #166534; }
        .hidden { display: none !important; }
        .input-error { border-color: rgba(225,29,72,.72) !important; box-shadow: 0 0 0 4px rgba(225,29,72,.10) !important; }
        .field-error { display: flex; gap: 8px; align-items: flex-start; color: #be123c; font-weight: 900; font-size: .8rem; line-height: 1.2; margin-top: 2px; font-family: 'Merriweather', serif; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1024px) {
            .sidebar {
                position: fixed;
                left: -100%;
                top: 0; bottom: 0;
                width: 280px;
                border-radius: 0;
                max-height: 100vh;
                box-shadow: 10px 0px 30px rgba(0,0,0,0.1);
            }
            .sidebar.active { left: 0; }
            .main-content { margin-left: 0; }
            .mobile-menu-btn { display: flex !important; }
            .header-btn-text { display: none; }
            .header { padding: 0 1rem; }
        }
    </style>
</head>

<body>
    <div class="overlay" id="overlay"></div>

    <!-- MODALE NOTIFICATIONS -->
    <div class="modal-overlay" id="notificationsModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2>
                    <!-- Bell icon -->
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#70AE48" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    Notifications
                </h2>
                <button class="modal-close" onclick="closeNotificationsModal()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="modal-body" id="notificationsList">
                <div class="empty-notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <p>Chargement des notifications...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- MODALE AIDE -->
    <div class="modal-overlay" id="helpModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2>
                    <!-- HelpCircle icon -->
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#70AE48" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Centre d'aide
                </h2>
                <button class="modal-close" onclick="closeHelpModal()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="help-search">
                    <input type="text" id="helpSearch" placeholder="Rechercher dans l'aide..." onkeyup="filterHelp()">
                </div>
                <div id="helpContent">
                    <div class="help-faq-item" onclick="toggleFaq(this)">
                        <div class="help-faq-question">
                            Comment ajouter un nouveau bien ?
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BDBDBD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div class="help-faq-answer">Pour ajouter un nouveau bien, cliquez sur "Ajouter un bien" dans le menu "GESTIONS DES BIENS". Remplissez ensuite les informations demandées et validez.</div>
                    </div>
                    <div class="help-faq-item" onclick="toggleFaq(this)">
                        <div class="help-faq-question">
                            Comment créer une location ?
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BDBDBD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div class="help-faq-answer">Allez dans "Nouvelle location" depuis le menu "GESTION LOCATIVE". Sélectionnez le bien et le locataire, puis définissez les conditions du bail.</div>
                    </div>
                    <div class="help-faq-item" onclick="toggleFaq(this)">
                        <div class="help-faq-question">
                            Comment enregistrer un paiement ?
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BDBDBD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div class="help-faq-answer">Dans "Gestion des paiements", cliquez sur "Enregistrer un paiement". Remplissez le montant, la date et sélectionnez le locataire concerné.</div>
                    </div>
                    <div class="help-faq-item" onclick="toggleFaq(this)">
                        <div class="help-faq-question">
                            Comment générer une quittance ?
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BDBDBD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div class="help-faq-answer">Dans la liste des paiements, cliquez sur l'icône PDF à côté du paiement concerné pour générer et télécharger la quittance.</div>
                    </div>
                    <div class="help-faq-item" onclick="toggleFaq(this)">
                        <div class="help-faq-question">
                            Comment inviter un autre gestionnaire ?
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BDBDBD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div class="help-faq-answer">Dans le menu "GESTION DES COPROPRIÉTAIRES", cliquez sur "Inviter un gestionnaire". Choisissez le type et remplissez ses informations.</div>
                    </div>
                </div>
                <div class="help-contact">
                    <p>Vous ne trouvez pas ce que vous cherchez ?</p>
                    <div class="help-contact-buttons">
                        <button class="help-contact-btn primary" onclick="contactSupport()">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            Nous contacter
                        </button>
                        <button class="help-contact-btn secondary" onclick="chatWithAI()">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#70AE48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21l4-4 4 4"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>
                            Assistant IA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODALE DÉCONNEXION -->
    <div class="modal-overlay" id="logoutModal">
        <div class="modal-container">
            <div class="modal-body" style="text-align: center;">
                <div class="logout-modal-icon">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                </div>
                <h3 class="logout-modal-title">Déconnexion</h3>
                <p class="logout-modal-message">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <div class="logout-modal-actions">
                    <button class="logout-modal-btn logout-modal-btn-secondary" onclick="closeLogoutModal()">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Annuler
                    </button>
                    <button class="logout-modal-btn logout-modal-btn-primary" onclick="confirmLogout()">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ─── HEADER ─── -->
    <header class="header">
        <div class="header-left">
            <button class="mobile-menu-btn" onclick="toggleSidebar()" style="display:none;">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span class="header-logo">Gestiloc</span>
        </div>
        <div class="header-right">
            <!-- Notifications -->
            <button class="header-btn" onclick="showNotificationsModal()" id="notificationBtn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFC107" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="header-btn-text">Notifications</span>
                <span class="notif-badge hidden" id="notificationBadge">2</span>
            </button>
            <!-- Aide -->
            <button class="header-btn" onclick="showHelpModal()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="header-btn-text">Aide</span>
            </button>
            <!-- Mon compte -->
            <button class="header-btn" onclick="goToReact('/coproprietaire/parametres')">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span class="header-btn-text">Mon compte</span>
            </button>
        </div>
    </header>

    <!-- ─── APP BODY ─── -->
    <div class="app-body">
        <!-- SIDEBAR -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-scroll">

                <!-- Menu principal -->
                <div class="menu-group">
                    <div class="menu-group-title">Menu principal</div>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/dashboard')">
                        <span class="menu-icon">
                            <!-- Dashboard icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#e6a817" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="12" width="4" height="8"/><rect x="10" y="7" width="4" height="13"/><rect x="17" y="3" width="4" height="17"/>
                            </svg>
                        </span>
                        <span>Tableau de bord</span>
                        <span class="menu-item-chevron">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </span>
                    </button>
                </div>

                <!-- GESTIONS DES BIENS -->
                <div class="menu-group">
                    <div class="menu-group-title">GESTIONS DES BIENS</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/biens/create')">
                        <span class="menu-icon">
                            <!-- UserPlus icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8CCC63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-3-3.87"/><path d="M8 21v-2a4 4 0 014-4h1"/><circle cx="12" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                        </span>
                        <span>Ajouter un bien</span>
                    </button>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/biens')">
                        <span class="menu-icon">
                            <!-- House icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FF9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
                            </svg>
                        </span>
                        <span>Mes biens</span>
                        <span class="menu-item-chevron">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </span>
                    </button>
                </div>

                <!-- GESTION LOCATIVE -->
                <div class="menu-group">
                    <div class="menu-group-title">GESTION LOCATIVE</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/assign-property/create')">
                        <span class="menu-icon">
                            <!-- Handshake icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4CAF50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 11h1a3 3 0 010 6h-1"/><path d="M9 12c.66 0 1.33.16 2 .5a5.1 5.1 0 012.5-1.5"/><path d="M6 11H5a3 3 0 000 6h1"/><path d="M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z"/>
                            </svg>
                        </span>
                        <span>Nouvelle location</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/tenants/create')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8CCC63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-3-3.87"/><path d="M8 21v-2a4 4 0 014-4h1"/><circle cx="12" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                        </span>
                        <span>Ajouter un locataire</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/tenants')">
                        <span class="menu-icon">
                            <!-- People icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FF7043" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/>
                            </svg>
                        </span>
                        <span>Liste des locataires</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/paiements')">
                        <span class="menu-icon">
                            <!-- Wallet icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffa726" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                        </span>
                        <span>Gestion des paiements</span>
                    </button>
                </div>

                <!-- DOCUMENTS -->
                <div class="menu-group">
                    <div class="menu-group-title">DOCUMENTS</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/leases')">
                        <span class="menu-icon">
                            <!-- File icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#529D21" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                            </svg>
                        </span>
                        <span>Contrats de bail</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/etats-des-lieux')">
                        <span class="menu-icon">
                            <!-- Clipboard icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7b1fa2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
                            </svg>
                        </span>
                        <span>Etats de lieux</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/notices')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#529D21" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                            </svg>
                        </span>
                        <span>Avis d'échéance</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/quittances')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7b1fa2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
                            </svg>
                        </span>
                        <span>Quittances de loyers</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/factures')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#529D21" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                            </svg>
                        </span>
                        <span>Factures et documents divers</span>
                    </button>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/documents')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#529D21" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                            </svg>
                        </span>
                        <span>Archivage de documents</span>
                        <span class="menu-item-chevron">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </span>
                    </button>
                </div>

                <!-- REPARATIONS ET TRAVAUX -->
                <div class="menu-group">
                    <div class="menu-group-title">REPARATIONS ET TRAVAUX</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/maintenance')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4CAF50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 11h1a3 3 0 010 6h-1"/><path d="M9 12c.66 0 1.33.16 2 .5a5.1 5.1 0 012.5-1.5"/><path d="M6 11H5a3 3 0 000 6h1"/><path d="M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z"/>
                            </svg>
                        </span>
                        <span>Réparations et travaux</span>
                    </button>
                </div>

                <!-- COMPTABILITE ET STATISTIQUES -->
                <div class="menu-group">
                    <div class="menu-group-title">COMPTABILITE ET STATISTIQUES</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/comptabilite')">
                        <span class="menu-icon">
                            <!-- TrendingUp icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4CAF50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </span>
                        <span>Comptabilité et statistiques</span>
                    </button>
                </div>

                <!-- GESTION DES COPROPRIÉTAIRES -->
                <div class="menu-group">
                    <div class="menu-group-title">GESTION DES COPROPRIÉTAIRES</div>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/gestionnaires')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FF7043" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/>
                            </svg>
                        </span>
                        <span>Liste des gestionnaires</span>
                    </button>
                    <button class="menu-item" onclick="navigateTo('/coproprietaire/gestionnaires/creer')">
                        <span class="menu-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8CCC63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-3-3.87"/><path d="M8 21v-2a4 4 0 014-4h1"/><circle cx="12" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                        </span>
                        <span>Inviter un gestionnaire</span>
                    </button>
                </div>

                <!-- CONFIGURATION -->
                <div class="menu-group">
                    <div class="menu-group-title">CONFIGURATION</div>
                    <button class="menu-item" onclick="goToReact('/coproprietaire/parametres')">
                        <span class="menu-icon">
                            <!-- Settings icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#607d8b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                            </svg>
                        </span>
                        <span>Paramètres</span>
                        <span class="menu-item-chevron">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </span>
                    </button>
                    <button class="menu-item" onclick="showLogoutModal()">
                        <span class="menu-icon">
                            <!-- LogOut icon -->
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#aaa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </span>
                        <span style="color:#9ca3af;">Déconnexion</span>
                    </button>
                </div>

            </div>

            <!-- Footer profil -->
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">
                        <?php
                        $user = auth()->user();
                        $initials = 'C';
                        if ($user) {
                            $fn = $user->first_name ?? '';
                            $ln = $user->last_name ?? '';
                            $name = $user->name ?? '';
                            $email = $user->email ?? '';
                            if ($fn || $ln) {
                                $initials = strtoupper(substr($fn,0,1)) . strtoupper(substr($ln,0,1));
                            } elseif ($name) {
                                $initials = strtoupper(substr($name,0,1));
                            } elseif ($email) {
                                $initials = strtoupper(substr($email,0,1));
                            }
                        }
                        echo trim($initials) ?: 'C';
                        ?>
                    </div>
                    <div class="user-info">
                        <div class="user-name">
                            <?php
                            if ($user) {
                                $fn = $user->first_name ?? '';
                                $ln = $user->last_name ?? '';
                                $full = trim("$fn $ln");
                                echo e($full ?: ($user->name ?? ($user->email ?? 'Co-propriétaire')));
                            } else {
                                echo 'Co-propriétaire';
                            }
                            ?>
                        </div>
                        <div class="user-role">Co-propriétaire</div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <div class="main-inner">
                @yield('content')
            </div>
        </div>
    </div>

    <script>
        const CONFIG = {
            LARAVEL_URL: 'http://localhost:8000',
            REACT_URL:   'http://localhost:8080',
            LOGIN_URL:   '/login',
            LOGOUT_URL:  '/logout'
        };

        // ─── MODALES ───
        function showNotificationsModal() {
            loadNotifications();
            document.getElementById('notificationsModal').classList.add('active');
        }
        function closeNotificationsModal() {
            document.getElementById('notificationsModal').classList.remove('active');
        }
        function showHelpModal() {
            document.getElementById('helpModal').classList.add('active');
        }
        function closeHelpModal() {
            document.getElementById('helpModal').classList.remove('active');
        }
        function showLogoutModal() {
            document.getElementById('logoutModal').classList.add('active');
        }
        function closeLogoutModal() {
            document.getElementById('logoutModal').classList.remove('active');
        }
        function confirmLogout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGOUT_URL;
        }

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            }
        });

        // ─── NOTIFICATIONS ───
        function loadNotifications() {
            const list = document.getElementById('notificationsList');
            const badge = document.getElementById('notificationBadge');

            const notifications = [
                { id:'1', icon:'payment',  iconSvg:'wallet',   title:'Paiement en attente',  message:'Un locataire a un paiement en retard', time:'Il y a 2 heures', unread:true  },
                { id:'2', icon:'tenant',   iconSvg:'userplus', title:'Nouveau locataire',    message:'Un nouveau locataire a été ajouté',     time:'Hier',            unread:true  },
                { id:'3', icon:'alert',    iconSvg:'alert',    title:'Préavis de départ',    message:'Un locataire a soumis un préavis',       time:'Il y a 3 jours',  unread:false },
                { id:'4', icon:'info',     iconSvg:'file',     title:'Quittance disponible', message:'Une nouvelle quittance a été générée',   time:'La semaine dern.', unread:false },
            ];

            const svgs = {
                wallet: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
                userplus:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-3-3.87"/><path d="M8 21v-2a4 4 0 014-4h1"/><circle cx="12" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
                alert:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
                file:   `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            };

            let html = '';
            notifications.forEach(n => {
                html += `
                    <div class="notification-item ${n.unread ? 'unread' : ''}">
                        <div class="notification-icon ${n.icon}">${svgs[n.iconSvg] || ''}</div>
                        <div class="notification-content">
                            <div class="notification-title">${n.title}</div>
                            <div class="notification-message">${n.message}</div>
                            <div class="notification-time">${n.time}</div>
                        </div>
                        ${n.unread ? '<div class="notification-badge-dot"></div>' : ''}
                    </div>`;
            });
            html += `<div class="notification-footer"><button onclick="markAllNotificationsRead()">Tout marquer comme lu</button></div>`;
            list.innerHTML = html;

            const unreadCount = notifications.filter(n => n.unread).length;
            badge.textContent = unreadCount;
            if (unreadCount > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }

        function markAllNotificationsRead() { loadNotifications(); }

        // ─── AIDE ───
        function toggleFaq(element) {
            const answer = element.querySelector('.help-faq-answer');
            const icon = element.querySelector('.faq-chevron');
            answer.classList.toggle('expanded');
            icon.style.transform = answer.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
            icon.style.transition = 'transform 0.25s';
        }
        function filterHelp() {
            const search = document.getElementById('helpSearch').value.toLowerCase();
            document.querySelectorAll('.help-faq-item').forEach(item => {
                const q = item.querySelector('.help-faq-question').textContent.toLowerCase();
                item.style.display = (!search || q.includes(search)) ? 'block' : 'none';
            });
        }
        function contactSupport() { window.location.href = 'mailto:support@gestiloc.com'; }
        function chatWithAI() { alert('Assistant IA - Fonctionnalité à venir'); }

        // ─── AUTH & NAVIGATION ───
        function getTokenFromAllSources() {
            let token = localStorage.getItem('token');
            if (token) return token;
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('api_token');
            if (token) { localStorage.setItem('token', token); return token; }
            const cookieVal = ('; ' + document.cookie).split('; laravel_token=').pop().split(';')[0];
            if (cookieVal && cookieVal !== document.cookie) { localStorage.setItem('token', cookieVal); return cookieVal; }
            token = sessionStorage.getItem('token');
            if (token) return token;
            return null;
        }

        function extractTokenFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('api_token');
            if (token) {
                localStorage.setItem('token', token);
                urlParams.delete('api_token');
                const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
                window.history.replaceState({}, '', newUrl);
                return token;
            }
            return null;
        }

        function goToReact(path) {
            let token = getTokenFromAllSources() || extractTokenFromUrl();
            if (!token) {
                alert('Session expirée. Redirection vers la page de connexion...');
                setTimeout(() => { window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL; }, 500);
                return;
            }
            const sep = path.includes('?') ? '&' : '?';
            setTimeout(() => { window.location.href = `${CONFIG.REACT_URL}${path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`; }, 100);
        }

        function navigateTo(path) {
            let token = getTokenFromAllSources() || extractTokenFromUrl();
            if (!token) {
                alert('Session expirée. Redirection vers la page de connexion...');
                setTimeout(() => { window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL; }, 500);
                return;
            }
            const sep = path.includes('?') ? '&' : '?';
            setTimeout(() => { window.location.href = `${CONFIG.LARAVEL_URL}${path}${sep}api_token=${encodeURIComponent(token)}&_t=${Date.now()}`; }, 100);
        }

        function getUrlParam(name) {
            return new URLSearchParams(window.location.search).get(name);
        }

        // ─── SIDEBAR MOBILE ───
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
        document.getElementById('overlay').addEventListener('click', toggleSidebar);

        // ─── MENU ACTIF ───
        function markActiveMenu() {
            const currentPath = window.location.pathname;
            document.querySelectorAll('.menu-item').forEach(item => {
                const onclick = item.getAttribute('onclick') || '';
                const match = onclick.match(/navigateTo\('([^']+)'\)/) || onclick.match(/goToReact\('([^']+)'\)/);
                if (match && match[1]) {
                    const menuPath = match[1];
                    if (currentPath === menuPath || currentPath.startsWith(menuPath + '/')) {
                        item.classList.add('active');
                    }
                }
            });
        }

        // ─── RESPONSIVE ───
        function checkMobile() {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            mobileBtn.style.display = window.innerWidth <= 1024 ? 'flex' : 'none';
        }
        window.addEventListener('resize', checkMobile);

        // ─── AUTH CHECK ───
        function checkAuthOnLoad() {
            if (window.location.href.includes('/login')) return;
            const token = getTokenFromAllSources();
            if (!token) {
                const urlToken = extractTokenFromUrl();
                if (!urlToken) {
                    setTimeout(() => {
                        if (!window.location.href.includes('/login')) {
                            alert('Votre session a expiré. Veuillez vous reconnecter.');
                            window.location.href = CONFIG.LARAVEL_URL + CONFIG.LOGIN_URL;
                        }
                    }, 1000);
                }
            }
        }

        // ─── INIT ───
        document.addEventListener('DOMContentLoaded', function () {
            extractTokenFromUrl();
            checkAuthOnLoad();
            markActiveMenu();
            checkMobile();
            setInterval(checkAuthOnLoad, 60000);
            loadNotifications();
        });
    </script>
</body>
</html>

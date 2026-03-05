<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReactRedirectController extends Controller
{
    /**
     * Redirection vers React avec paramètres
     */
    public function redirect(Request $request, $path = null)
    {
        $reactUrl = config('app.react_url', 'http://localhost:8080');
        
        // Construire l'URL de redirection
        $redirectPath = $path ?? '';
        $fullUrl = rtrim($reactUrl, '/') . '/' . ltrim($redirectPath, '/');
        
        // Si un token est présent, le transférer
        if ($request->has('token')) {
            $fullUrl .= (strpos($fullUrl, '?') !== false ? '&' : '?') . 'token=' . $request->token;
        }
        
        return redirect($fullUrl);
    }
}

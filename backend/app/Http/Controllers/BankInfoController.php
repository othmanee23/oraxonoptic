<?php

namespace App\Http\Controllers;

use App\Models\BankInfo;
use Illuminate\Http\Request;

class BankInfoController extends Controller
{
    public function show(Request $request)
    {
        $bankInfo = BankInfo::query()->latest('id')->first();

        if (! $bankInfo) {
            return response()->json([
                'bank_name' => 'Banque Nationale',
                'account_name' => 'OrAxonOptic OPTIC SARL',
                'iban' => '',
                'swift' => '',
                'rib' => '',
            ]);
        }

        return response()->json($bankInfo);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'super_admin') {
            abort(403, 'Forbidden');
        }

        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:255'],
            'account_name' => ['required', 'string', 'max:255'],
            'iban' => ['nullable', 'string', 'max:255'],
            'swift' => ['nullable', 'string', 'max:255'],
            'rib' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['iban'] = $validated['iban'] ?? '';
        $validated['swift'] = $validated['swift'] ?? '';

        $bankInfo = BankInfo::query()->latest('id')->first();
        if ($bankInfo) {
            $bankInfo->update($validated);
        } else {
            $bankInfo = BankInfo::create($validated);
        }

        return response()->json($bankInfo);
    }
}

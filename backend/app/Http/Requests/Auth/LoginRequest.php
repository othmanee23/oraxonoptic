<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Validator;

class LoginRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $this->merge([
            'email' => is_string($email) ? strtolower(trim($email)) : $email,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $email = $this->input('email');
            if (is_string($email) && preg_match('/[\p{C}\s]/u', $email)) {
                $validator->errors()->add('email', 'EMAIL_HAS_SPACES');
            }

            $password = $this->input('password');
            if (is_string($password) && preg_match('/[\p{C}\s]/u', $password)) {
                $validator->errors()->add('password', 'PASSWORD_HAS_SPACES');
            }
        });
    }

    protected function ruleCodeMap(): array
    {
        return [
            'email' => [
                'Required' => [
                    'code' => 'EMAIL_REQUIRED',
                    'message' => 'L’email est obligatoire.',
                ],
                'Email' => [
                    'code' => 'EMAIL_INVALID_FORMAT',
                    'message' => 'Le format de l’email est invalide.',
                ],
                'Max' => [
                    'code' => 'EMAIL_INVALID_FORMAT',
                    'message' => 'Le format de l’email est invalide.',
                ],
            ],
            'password' => [
                'Required' => [
                    'code' => 'PASSWORD_REQUIRED',
                    'message' => 'Le mot de passe est obligatoire.',
                ],
            ],
        ];
    }

    protected function messageCodeMap(): array
    {
        return [
            'EMAIL_HAS_SPACES' => [
                'code' => 'EMAIL_HAS_SPACES',
                'message' => 'L’email ne doit pas contenir d’espaces.',
            ],
            'PASSWORD_HAS_SPACES' => [
                'code' => 'PASSWORD_HAS_SPACES',
                'message' => 'Le mot de passe ne doit pas contenir d’espaces.',
            ],
        ];
    }
}

<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RegisterRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $this->merge([
            'first_name' => is_string($this->input('first_name')) ? trim($this->input('first_name')) : $this->input('first_name'),
            'last_name' => is_string($this->input('last_name')) ? trim($this->input('last_name')) : $this->input('last_name'),
            'email' => is_string($email) ? strtolower(trim($email)) : $email,
            'phone' => is_string($this->input('phone')) ? trim($this->input('phone')) : $this->input('phone'),
        ]);
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:50', 'regex:/^[\\p{L}][\\p{L}\\s-]*$/u'],
            'last_name' => ['required', 'string', 'min:2', 'max:50', 'regex:/^[\\p{L}][\\p{L}\\s-]*$/u'],
            'email' => ['required', 'email:rfc,dns', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['nullable', 'regex:/^\\d{10}$/'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $email = $this->input('email');
            if (is_string($email) && preg_match('/[\\p{C}\\s]/u', $email)) {
                $validator->errors()->add('email', 'EMAIL_HAS_SPACES');
            }

            $password = $this->input('password');
            if (!is_string($password)) {
                return;
            }

            if (preg_match('/[\\p{C}\\s]/u', $password)) {
                $validator->errors()->add('password', 'PASSWORD_HAS_SPACES');
            }

            if (!preg_match('/[A-Z]/', $password)) {
                $validator->errors()->add('password', 'PASSWORD_MISSING_UPPER');
            }

            if (!preg_match('/[0-9]/', $password)) {
                $validator->errors()->add('password', 'PASSWORD_MISSING_NUMBER');
            }

            if (!preg_match('/[^A-Za-z0-9]/', $password)) {
                $validator->errors()->add('password', 'PASSWORD_MISSING_SYMBOL');
            }
        });
    }

    protected function ruleCodeMap(): array
    {
        return [
            'first_name' => [
                'Required' => [
                    'code' => 'FIRST_NAME_REQUIRED',
                    'message' => 'Le prénom est obligatoire.',
                ],
                'Min' => [
                    'code' => 'FIRST_NAME_TOO_SHORT',
                    'message' => 'Le prénom doit contenir au moins 2 caractères.',
                ],
                'Max' => [
                    'code' => 'FIRST_NAME_TOO_LONG',
                    'message' => 'Le prénom ne doit pas dépasser 50 caractères.',
                ],
                'Regex' => [
                    'code' => 'FIRST_NAME_INVALID_CHARS',
                    'message' => 'Le prénom ne peut contenir que des lettres, espaces et tirets.',
                ],
            ],
            'last_name' => [
                'Required' => [
                    'code' => 'LAST_NAME_REQUIRED',
                    'message' => 'Le nom est obligatoire.',
                ],
                'Min' => [
                    'code' => 'LAST_NAME_TOO_SHORT',
                    'message' => 'Le nom doit contenir au moins 2 caractères.',
                ],
                'Max' => [
                    'code' => 'LAST_NAME_TOO_LONG',
                    'message' => 'Le nom ne doit pas dépasser 50 caractères.',
                ],
                'Regex' => [
                    'code' => 'LAST_NAME_INVALID_CHARS',
                    'message' => 'Le nom ne peut contenir que des lettres, espaces et tirets.',
                ],
            ],
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
                'Unique' => [
                    'code' => 'EMAIL_ALREADY_USED',
                    'message' => 'Cet email est déjà utilisé.',
                ],
            ],
            'phone' => [
                'Regex' => [
                    'code' => 'PHONE_INVALID_FORMAT',
                    'message' => 'Le téléphone doit contenir exactement 10 chiffres (ex: 0612345678).',
                ],
            ],
            'password' => [
                'Required' => [
                    'code' => 'PASSWORD_REQUIRED',
                    'message' => 'Le mot de passe est obligatoire.',
                ],
                'Min' => [
                    'code' => 'PASSWORD_TOO_SHORT',
                    'message' => 'Le mot de passe doit contenir au moins 8 caractères.',
                ],
                'Confirmed' => [
                    'code' => 'PASSWORD_CONFIRM_MISMATCH',
                    'message' => 'Les mots de passe ne correspondent pas.',
                ],
            ],
            'password_confirmation' => [
                'Required' => [
                    'code' => 'PASSWORD_CONFIRM_REQUIRED',
                    'message' => 'Confirmez votre mot de passe.',
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
            'PASSWORD_MISSING_UPPER' => [
                'code' => 'PASSWORD_MISSING_UPPER',
                'message' => 'Ajoutez au moins une majuscule.',
            ],
            'PASSWORD_MISSING_NUMBER' => [
                'code' => 'PASSWORD_MISSING_NUMBER',
                'message' => 'Ajoutez au moins un chiffre.',
            ],
            'PASSWORD_MISSING_SYMBOL' => [
                'code' => 'PASSWORD_MISSING_SYMBOL',
                'message' => 'Ajoutez au moins un symbole (ex: !@#$…).',
            ],
        ];
    }
}

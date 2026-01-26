<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class ApiFormRequest extends FormRequest
{
    protected function failedValidation(Validator $validator): void
    {
        $failed = $validator->failed();
        $errors = [];

        foreach ($failed as $field => $rules) {
            foreach (array_keys($rules) as $rule) {
                $mapped = $this->ruleError($field, $rule);
                if ($mapped) {
                    $this->pushError($errors, $field, $mapped['code'], $mapped['message']);
                }
            }
        }

        foreach ($validator->errors()->getMessages() as $field => $messages) {
            foreach ($messages as $message) {
                $mapped = $this->messageError($message);
                if ($mapped) {
                    $this->pushError($errors, $field, $mapped['code'], $mapped['message']);
                    continue;
                }

                if (!isset($failed[$field])) {
                    $this->pushError($errors, $field, 'VALIDATION_ERROR', $message);
                }
            }
        }

        throw new HttpResponseException(response()->json([
            'message' => 'Validation échouée.',
            'errors' => $errors,
        ], 422));
    }

    protected function pushError(array &$errors, string $field, string $code, string $message): void
    {
        $errors[$field] = $errors[$field] ?? [];
        foreach ($errors[$field] as $existing) {
            if (($existing['code'] ?? null) === $code) {
                return;
            }
        }
        $errors[$field][] = ['code' => $code, 'message' => $message];
    }

    protected function messageError(string $message): ?array
    {
        $map = $this->messageCodeMap();
        return $map[$message] ?? null;
    }

    protected function ruleError(string $field, string $rule): ?array
    {
        $map = $this->ruleCodeMap();
        return $map[$field][$rule] ?? null;
    }

    /**
     * Return rule -> code/message map.
     * Format: ['field' => ['Rule' => ['code' => '', 'message' => '']]]
     */
    abstract protected function ruleCodeMap(): array;

    /**
     * Return message -> code/message map for custom validator errors.
     */
    abstract protected function messageCodeMap(): array;
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = \App\Models\Tenant::class;

    public function definition(): array
    {
        return [
            'user_id' => null, // Will be set when creating
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'pending']),
            'solvency_score' => $this->faker->numberBetween(1, 10),
            'meta' => []
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}

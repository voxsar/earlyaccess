<?php

namespace App\Console\Commands;

use Auth;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateProductCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cpc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    const WISHLIST_METAFIELD_NAMESPACE = 'app';
    const WISHLIST_METAFIELD_KEY = 'wishlist';
    const TIMESTAMPS_METAFIELD_KEY = 'wishlist_timestamps';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
		$shop = Auth::loginUsingId(3);//User::first();
		//23675680456777
		$customerId = "gid://shopify/Customer/23675680456777";

		$this->info("Getting metafield for customerId: " . $customerId );

		$this->updateCustomerMetafield(
			$customerId,
			self::WISHLIST_METAFIELD_NAMESPACE,
			self::WISHLIST_METAFIELD_KEY,
			json_encode(["gid://shopify/Product/15410982256713"]),
			"list.product_reference",
			$shop
		);
    }

	public static function updateCustomerMetafield($customerId, $namespace, $key, $value, $type, $shop)
    {
		$customerId = $customerId;
        $mutation = '
            mutation updateCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        namespace
                        key
                        value
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        ';

        $variables = [
            'metafields' => [
                [
                    'ownerId' => $customerId,
                    'namespace' => $namespace,
                    'key' => $key,
                    'value' => $value,
                    'type' => $type
                ]
            ]
        ];

        try {
            $response = $shop->api()->graph($mutation, $variables);
            
            if (isset($response['errors']) && $response['errors'] != false) {
                Log::error('GraphQL errors in updateCustomerMetafield:', $response);
                throw new \Exception('GraphQL mutation failed: ' . json_encode($response));
            }

            $errors = $response['body']['data']['metafieldsSet']['userErrors'] ?? [];
            if (!empty($errors)) {
                throw new \Exception("Metafield update failed: {$errors[0]['message']}");
            }

            return $response['body']['data']['metafieldsSet']['metafields'][0] ?? null;
        } catch (\Exception $error) {
            Log::error('Error updating customer metafield: ' . $error->getMessage());
            throw $error;
        }
    }
}

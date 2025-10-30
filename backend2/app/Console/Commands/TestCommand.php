<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test';

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
		$shop = User::first();

		//23675680456777
		$customerId = "gid://shopify/Customer/23675680456777";

		$this->getCustomerMetafield(
			$customerId,
			self::WISHLIST_METAFIELD_NAMESPACE,
			self::WISHLIST_METAFIELD_KEY,
			$shop
		);
    }

	public static function getCustomerMetafield($customerId, $namespace, $key, $shop)
    {
		$customerId = "gid://shopify/Customer/" .  $customerId;
        $query = '
            query getCustomerMetafield($customerId: ID!, $namespace: String!, $key: String!) {
                customer(id: $customerId) {
                    id
                    metafield(namespace: $namespace, key: $key) {
                        id
                        value
                        type
                    }
                }
            }
        ';

        $variables = [
            'customerId' => $customerId,
            'namespace' => $namespace,
            'key' => $key
        ];

        try {
            $response = $shop->api()->graph($query, $variables);
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in getCustomerMetafield:', $response);
                throw new \Exception('GraphQL query failed: ' . json_encode($response));
            }

            return $response['body']['data']['customer']['metafield'] ?? null;
        } catch (\Exception $error) {
            Log::error('Error getting customer metafield: ' . $error);
            throw $error;
        }
    }
}

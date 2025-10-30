<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ShopifyService
{
    /**
     * Get customer metafield using GraphQL
     */
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
                throw new \Exception('GraphQL query failed: ' . json_encode($response['errors']));
            }

            return $response['body']['data']['customer']['metafield'] ?? null;
        } catch (\Exception $error) {
            Log::error('Error getting customer metafield: ' . $error);
            throw $error;
        }
    }

    /**
     * Update customer metafield using GraphQL
     */
    public static function updateCustomerMetafield($customerId, $namespace, $key, $value, $type, $shop)
    {
		$customerId = "gid://shopify/Customer/" .  $customerId;
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
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in updateCustomerMetafield:', $response['errors']);
                throw new \Exception('GraphQL mutation failed: ' . json_encode($response['errors']));
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

    /**
     * Get products by IDs using GraphQL
     */
    public static function getProductsByIds($productIds, $shop)
    {
        $query = '
            query getProducts($ids: [ID!]!) {
                nodes(ids: $ids) {
                    ... on Product {
                        id
                        title
                        handle
                        onlineStoreUrl
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        featuredImage {
                            url
                            altText
                        }
                        availableForSale
                        totalInventory
                    }
                }
            }
        ';

        $variables = [
            'ids' => $productIds
        ];

        try {
            $response = $shop->api()->graph($query, $variables);
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in getProductsByIds:', $response['errors']);
                throw new \Exception('GraphQL query failed: ' . json_encode($response['errors']));
            }

            return $response['body']['data']['nodes'] ?? [];
        } catch (\Exception $error) {
            Log::error('Error getting products: ' . $error->getMessage());
            throw $error;
        }
    }

    /**
     * Get customer by ID using GraphQL
     */
    public static function getCustomerById($customerId, $shop)
    {
		$customerId = "gid://shopify/Customer/" .  $customerId;
        $query = '
            query getCustomer($customerId: ID!) {
                customer(id: $customerId) {
                    id
                    email
                    firstName
                    lastName
                }
            }
        ';

        $variables = [
            'customerId' => $customerId
        ];

        try {
            $response = $shop->api()->graph($query, $variables);
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in getCustomerById:', $response['errors']);
                throw new \Exception('GraphQL query failed: ' . json_encode($response['errors']));
            }

            return $response['body']['data']['customer'] ?? null;
        } catch (\Exception $error) {
            Log::error('Error getting customer: ' . $error->getMessage());
            throw $error;
        }
    }

    /**
     * Search products using GraphQL (additional utility method)
     */
    public static function searchProducts($query, $limit = 10, $shop)
    {
        $graphqlQuery = '
            query searchProducts($query: String!, $first: Int!) {
                products(query: $query, first: $first) {
                    edges {
                        node {
                            id
                            title
                            handle
                            onlineStoreUrl
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            featuredImage {
                                url
                                altText
                            }
                            availableForSale
                            totalInventory
                        }
                    }
                }
            }
        ';

        $variables = [
            'query' => $query,
            'first' => $limit
        ];

        try {
            $response = $shop->api()->graph($graphqlQuery, $variables);
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in searchProducts:', $response['errors']);
                throw new \Exception('GraphQL query failed: ' . json_encode($response['errors']));
            }

            $edges = $response['body']['data']['products']['edges'] ?? [];
            return array_map(function($edge) {
                return $edge['node'];
            }, $edges);
        } catch (\Exception $error) {
            Log::error('Error searching products: ' . $error->getMessage());
            throw $error;
        }
    }

    /**
     * Get all customers (with pagination support)
     */
    public static function getCustomers($limit = 50, $cursor = null, $shop)
    {
        $after = $cursor ? ", after: \"$cursor\"" : '';
        
        $query = "
            query getCustomers {
                customers(first: $limit$after) {
                    edges {
                        node {
                            id
                            email
                            firstName
                            lastName
                            createdAt
                            updatedAt
                        }
                        cursor
                    }
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                }
            }
        ";

        try {
            $response = $shop->api()->graph($query);
            
            if (isset($response['errors'])) {
                Log::error('GraphQL errors in getCustomers:', $response['errors']);
                throw new \Exception('GraphQL query failed: ' . json_encode($response['errors']));
            }

            return $response['body']['data']['customers'] ?? null;
        } catch (\Exception $error) {
            Log::error('Error getting customers: ' . $error->getMessage());
            throw $error;
        }
    }
}
# Custom Event Tracking Guide

Track user behavior and custom business events with Cuoral's intelligence API.

## Quick Start

```jsx
import React, { useRef } from 'react';
import { CuoralLauncher } from 'cuoral-react-native-expo';

function App() {
  const cuoralRef = useRef(null);

  return (
    <CuoralLauncher
      ref={cuoralRef}
      publicKey="YOUR_PUBLIC_KEY"
    />
  );
}
```

## Tracking Methods

### 1. Track Page/Screen Views

Track when users navigate to different screens:

```jsx
cuoralRef.current?.trackPageView('/checkout', {
  cart_items: 3,
  total_value: 99.99,
  currency: 'USD',
});
```

**Use Cases:**
- Screen navigation tracking
- User journey analysis
- Time spent on screens
- Screen performance monitoring

### 2. Track Errors

Track errors and exceptions manually:

```jsx
try {
  await processPayment();
} catch (error) {
  cuoralRef.current?.trackError(
    error.message,
    error.stack,
    {
      payment_method: 'credit_card',
      amount: 99.99,
      user_id: currentUser.id,
    }
  );
  
  // Show error to user
  Alert.alert('Payment Failed', error.message);
}
```

**Use Cases:**
- Payment failures
- API errors
- Validation errors
- User-facing errors

### 3. Track Custom Events

Track any custom business action or user interaction:

```jsx
// E-commerce events
cuoralRef.current?.trackCustomEvent(
  'add_to_cart',
  'ecommerce',
  {
    item_id: product.id,
    item_name: product.name,
    price: product.price,
    quantity: 1,
    category: product.category,
  }
);

// User engagement
cuoralRef.current?.trackCustomEvent(
  'search_performed',
  'engagement',
  {
    query: searchTerm,
    results_count: searchResults.length,
    filters_applied: activeFilters,
  }
);

// Feature usage
cuoralRef.current?.trackCustomEvent(
  'feature_enabled',
  'preferences',
  {
    feature_name: 'dark_mode',
    enabled: true,
  }
);

// Conversion events
cuoralRef.current?.trackCustomEvent(
  'signup_completed',
  'conversion',
  {
    signup_method: 'google',
    user_type: 'premium',
  }
);
```

## Event Categories

Use these standardized categories for consistency:

| Category | Description | Examples |
|----------|-------------|----------|
| `ecommerce` | Shopping and transactions | add_to_cart, checkout_started, purchase_completed |
| `engagement` | User interactions | search_performed, filter_applied, content_shared |
| `navigation` | Screen/page changes | menu_opened, tab_switched, back_pressed |
| `conversion` | Goal completions | signup_completed, subscription_started, trial_activated |
| `user_action` | Generic actions | button_clicked, link_opened, action_performed |
| `preferences` | Settings changes | theme_changed, language_switched, notifications_enabled |
| `media` | Media interactions | video_played, audio_started, image_viewed |
| `error` | Custom error tracking | validation_failed, api_timeout, payment_declined |

## Real-World Examples

### E-commerce App

```jsx
// Product viewed
cuoralRef.current?.trackCustomEvent('product_viewed', 'ecommerce', {
  product_id: product.id,
  product_name: product.name,
  category: product.category,
  price: product.price,
});

// Add to cart
const handleAddToCart = (product, quantity) => {
  addToCart(product, quantity);
  
  cuoralRef.current?.trackCustomEvent('add_to_cart', 'ecommerce', {
    product_id: product.id,
    quantity: quantity,
    cart_total: calculateCartTotal(),
  });
};

// Checkout started
const handleCheckout = () => {
  cuoralRef.current?.trackCustomEvent('checkout_started', 'conversion', {
    cart_items: cart.length,
    cart_total: calculateCartTotal(),
    payment_method_selected: selectedPaymentMethod,
  });
  
  navigation.navigate('Checkout');
};

// Purchase completed
const handlePurchaseComplete = (order) => {
  cuoralRef.current?.trackCustomEvent('purchase_completed', 'conversion', {
    order_id: order.id,
    total: order.total,
    items_count: order.items.length,
    payment_method: order.payment_method,
  });
};
```

### Social Media App

```jsx
// Post created
cuoralRef.current?.trackCustomEvent('post_created', 'engagement', {
  post_type: 'text',
  has_image: false,
  has_video: false,
  character_count: postText.length,
});

// Content shared
cuoralRef.current?.trackCustomEvent('content_shared', 'engagement', {
  content_type: 'post',
  share_destination: 'twitter',
});

// Profile viewed
cuoralRef.current?.trackCustomEvent('profile_viewed', 'navigation', {
  profile_user_id: userId,
  is_following: checkIfFollowing(userId),
});
```

### Subscription App

```jsx
// Trial started
cuoralRef.current?.trackCustomEvent('trial_started', 'conversion', {
  plan_name: 'premium',
  trial_duration_days: 7,
});

// Subscription upgraded
cuoralRef.current?.trackCustomEvent('subscription_upgraded', 'conversion', {
  from_plan: 'basic',
  to_plan: 'premium',
  billing_cycle: 'monthly',
});

// Feature accessed (paywall)
cuoralRef.current?.trackCustomEvent('paywall_shown', 'engagement', {
  feature_name: 'advanced_analytics',
  user_plan: currentPlan,
});
```

## Using Direct API (Without Component)

If you need to track events outside of your main component:

```jsx
import { CuoralIntelligence } from 'cuoral-react-native-expo';

// In any file
export const trackPurchase = (order) => {
  CuoralIntelligence.trackCustomEvent('purchase_completed', 'conversion', {
    order_id: order.id,
    total: order.total,
  });
};

// In your analytics utility
export const logError = (error, context) => {
  console.error(error);
  
  CuoralIntelligence.trackError(error.message, error.stack, {
    ...context,
    timestamp: Date.now(),
  });
};
```

**Note:** The direct API requires a session to be initialized by the CuoralLauncher component first.

## Automatic Metadata

Every event automatically includes:

```json
{
  "viewport_width": 390,
  "viewport_height": 844,
  "screen_width": 390,
  "screen_height": 844,
  "platform": "ios",
  "platform_version": "17.0",
  "user_agent": "ReactNative/ios/17.0"
}
```

## Best Practices

### ✅ Do's

- Use descriptive, consistent event names
- Include relevant context in properties
- Track both successes and failures
- Use standardized categories
- Add timestamps for time-sensitive events
- Include user/session identifiers when relevant

### ❌ Don'ts

- Don't include sensitive data (passwords, credit card numbers, SSNs)
- Don't use dynamic category names
- Don't send too many properties (keep it focused)
- Don't track every single interaction (be selective)
- Don't use spaces in event names (use underscores)

### Event Naming Convention

```
verb_noun
```

Examples:
- `button_clicked`
- `video_played`
- `purchase_completed`
- `filter_applied`
- `error_occurred`

## Viewing Your Events

1. Go to Cuoral Dashboard
2. Navigate to **Intelligence & Analytics**
3. Select **Custom Events**
4. Filter by category, date range, or event name

## Debugging

Enable debug mode to see events being sent:

```jsx
<CuoralLauncher
  ref={cuoralRef}
  publicKey="YOUR_KEY"
  debug={true}  // Shows tracking in console
/>
```

Console output:
```
[Intelligence] Sending to: https://api.cuoral.com/customer-intelligence/session-recording/batch
[Intelligence] Payload: {...}
[Intelligence] Event sent successfully
```

## Support

- 📧 Email: support@cuoral.com
- 📖 Docs: https://docs.cuoral.com
- 💬 Dashboard: https://app.cuoral.com

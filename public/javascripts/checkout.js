const baseCheckoutForm = $('#base-checkout-form');
const cardCheckoutForm = $('#card-checkout-form');
const checkoutFormButton = $('#checkoutFormButton');
let stripeToken = '';
function changePayementType(value) {
  if (value == 'CARD') {
    checkoutFormButton.addClass('hide');
    $('#card-checkout-form').removeClass('hide');
    Stripe.setPublishableKey('pk_test_a5SodfxUKLp2w7XIqKgy50AL');
  } else if (value == 'COD') {
    $('#card-checkout-form').addClass('hide');
    checkoutFormButton.removeClass('hide');
  }
}

baseCheckoutForm.submit(() => {
  if (baseCheckoutForm.valid()) {
    checkoutFormButton.prop('disabled', true);
    $('#charge-error').removeClass('hidden');
    baseCheckoutForm.append(
      $('<input type="hidden" name="stripeToken" />').val(stripeToken)
    );
    return true;
  } else {
    return false;
  }
});

cardCheckoutForm.submit(() => {
  $('#charge-error').addClass('hidden');
  cardCheckoutForm.find('button').prop('disabled', true);
  Stripe.card.createToken(
    {
      number: $('#card-number').val(),
      cvc: $('#card-cvc').val(),
      exp_month: $('#card-expiry-month').val(),
      exp_year: $('#card-expiry-year').val(),
      name: $('#card-name').val()
    },
    stripeResponseHandler
  );
  return false;
});

function stripeResponseHandler(status, response) {
  if (response.error) {
    // Problem!

    // Show the errors on the form
    $('#charge-error').text(response.error.message);
    $('#charge-error').removeClass('hidden');
    cardCheckoutForm.find('button').prop('disabled', false); // Re-enable submission
  } else {
    // Token was created!

    // Get the token ID:
    stripeToken = response.id;

    // // Submit the form:
    baseCheckoutForm.submit();
  }
}

Stripe.setPublishableKey('pk_test_K1StRtOR46wge7d2VZazSic1');

var $form = $('#checkout-form');

$form.submit(function (event) {
    $form.find('#charge-error').addClass('d-none');
    $form.find('#finalbutton').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    return false;

});

function stripeResponseHandler(status, response) {
    if(response.error){
        $form.find('#charge-error').text(response.error.message);
        $form.find('#charge-error').removeClass('d-none');
        $form.find('#finalbutton').prop('disabled', false);
    } else {

        var token = response.id;
        $form.append($('<input type="hidden" name="stripeToken"/>').val(token));

        $form.get(0).submit();
            }
}
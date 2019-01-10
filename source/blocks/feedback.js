customer = document.querySelectorAll('.customer');
review = document.querySelectorAll('.review');

function feedbackChanger(n) {
  customer[n].addEventListener('focus', function() {
    customer.forEach(e => e.classList.remove('customer--active'));
    customer[n].classList.add('customer--active');

    review.forEach(e => e.classList.remove('review--active'));
    review[n].classList.add('review--active');
  });
};

[0, 1, 2].forEach(n => feedbackChanger(n));
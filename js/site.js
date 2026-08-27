
const PRICES = {
  USD: {
    month: { council: "$79 <small>/ mo</small>", founding: "Founding $59", week: "$19" },
    year: { council: "$790 <small>/ yr</small>", founding: "Founding $590", week: "$19" }
  },
  GHS: {
    month: { council: "GHS 950 <small>/ mo</small>", founding: "Founding GHS 700", week: "GHS 230" },
    year: { council: "GHS 9,500 <small>/ yr</small>", founding: "Founding GHS 7,000", week: "GHS 230" }
  }
};
let currency = "USD";
let period = "month";
function render() {
  const p = PRICES[currency][period];
  document.querySelectorAll("[data-price='council']").forEach(el => el.innerHTML = p.council);
  document.querySelectorAll("[data-founding='council']").forEach(el => el.textContent = p.founding);
  document.querySelectorAll("[data-price='week']").forEach(el => el.innerHTML = p.week);
}
document.querySelectorAll("[data-currency]").forEach(btn => {
  btn.addEventListener("click", () => {
    currency = btn.dataset.currency;
    document.querySelectorAll("[data-currency]").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    render();
  });
});
document.querySelectorAll("[data-period]").forEach(btn => {
  btn.addEventListener("click", () => {
    period = btn.dataset.period;
    document.querySelectorAll("[data-period]").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    render();
  });
});

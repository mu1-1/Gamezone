async function loadProducts() {
  const container = document.getElementById("products");

  if (!container) return;

  container.textContent = "Loading products...";

  try {
    const response = await fetch("/api/admin/products");

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const data = await response.json();
    const products = data.products || [];

    if (!products.length) {
      container.textContent = "No products found.";
      return;
    }

    container.innerHTML = products.map(product => {
      const isInStock = product.active === true;

      return `
        <div class="product-row">
          <div class="product-info">
            <strong>${escapeHtml(product.name)}</strong>
            <span>
              ${escapeHtml(product.category)}
              · ${Number(product.jod).toFixed(2)} JOD
            </span>
          </div>

          <div class="product-actions">

            <span class="stock ${isInStock ? "in" : "out"}">
              ${isInStock ? "IN STOCK" : "OUT OF STOCK"}
            </span>

            <button
              class="stock-btn ${isInStock ? "" : "out"}"
              data-product-id="${escapeHtml(product.id)}"
              data-active="${isInStock}"
            >
              ${isInStock ? "TURN OFF" : "TURN ON"}
            </button>

          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".stock-btn").forEach(button => {
      button.addEventListener("click", async () => {

        const id = button.dataset.productId;
        const currentActive = button.dataset.active === "true";

        button.disabled = true;
        button.textContent = "UPDATING...";

        try {
          const response = await fetch("/api/admin/products", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              id,
              active: !currentActive
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to update stock");
          }

          await loadProducts();

        } catch (error) {
          console.error(error);
          alert(error.message);
          await loadProducts();
        }
      });
    });

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="err">
        Unable to load products.
      </div>
    `;
  }
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

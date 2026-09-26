async function loadProducts() {
  const response = await fetch("/api/admin/products");

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const data = await response.json();

  return data.products || [];
}

async function setProductStock(id, active) {
  const response = await fetch("/api/admin/products", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      active
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update stock");
  }

  return data.product;
}

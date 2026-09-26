async function checkStock(productIds, productName) {
  try {
    const response = await fetch(
      "/api/products?ids=" + encodeURIComponent(productIds.join(","))
    );

    if (!response.ok) return;

    const data = await response.json();

    const products = data.products || [];

    const available = products.length > 0 &&
      products.some(product => product.active === true);

    if (available) return;

    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:grid;
        place-items:center;
        padding:30px;
        background:#05090f;
        color:white;
        text-align:center;
        font-family:Arial,sans-serif;
      ">
        <div>
          <div style="font-size:70px;margin-bottom:20px;">📦</div>

          <div style="
            color:#ff8d8d;
            font-size:11px;
            font-weight:900;
            letter-spacing:3px;
            margin-bottom:15px;
          ">
            OUT OF STOCK
          </div>

          <h1 style="font-size:42px;margin:0 0 15px;">
            ${productName} are currently unavailable.
          </h1>

          <p style="
            color:#91a0b4;
            max-width:500px;
            line-height:1.7;
            margin:0 auto 25px;
          ">
            We're currently out of ${productName}.
            Please check back later.
          </p>

          <a href="index.html#currencies" style="
            display:inline-block;
            background:#12a8ff;
            color:#06121c;
            padding:13px 20px;
            border-radius:9px;
            text-decoration:none;
            font-weight:900;
          ">
            BACK TO STORE
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Stock check failed:", error);
  }
}
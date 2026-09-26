const $ = (s) => document.querySelector(s);

async function j(url, opt = {}) {
  const r = await fetch(url, opt);
  const d = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw Error(d.error || "Request failed");
  }

  return d;
}


// LOGIN
$("#loginBtn").onclick = async () => {

  try {

    await j("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: $("#password").value
      })
    });

    $("#login").hidden = true;
    $("#dashboard").hidden = false;

    loadProducts();

  } catch (e) {

    $("#loginErr").textContent = e.message;

  }

};


// PRODUCTS
async function loadProducts() {

  const box = $("#products");

  box.innerHTML = "Loading products...";

  try {

    const data = await j("/api/admin/products");

    if (!data.products.length) {
      box.innerHTML = '<p class="muted">No products found.</p>';
      return;
    }

    box.innerHTML = data.products.map(product => {

      const active = product.active;

      return `
        <div class="product-row">

          <div class="product-info">

            <strong>${esc(product.name)}</strong>

            <span>
              ${esc(product.category)}
              · ${product.jod} JOD
            </span>

          </div>

          <div class="product-actions">

            <span class="stock ${active ? "in" : "out"}">
              ${active ? "IN STOCK" : "OUT OF STOCK"}
            </span>

            <button
              class="stock-btn ${active ? "" : "out"}"
              data-product-id="${esc(product.id)}"
              data-active="${active}"
            >
              ${active ? "MARK OUT OF STOCK" : "MARK IN STOCK"}
            </button>

          </div>

        </div>
      `;

    }).join("");


    box.querySelectorAll(".stock-btn").forEach(button => {

      button.onclick = async () => {

        const id = button.dataset.productId;
        const currentlyActive = button.dataset.active === "true";

        button.disabled = true;
        button.textContent = "UPDATING...";

        try {

          await j("/api/admin/products", {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              id,
              active: !currentlyActive
            })
          });

          await loadProducts();

        } catch (e) {

          alert(e.message);

          button.disabled = false;

        }

      };

    });


  } catch (e) {

    box.innerHTML =
      `<div class="err">${esc(e.message)}</div>`;

  }

}


// ORDER SEARCH
$("#search").onclick = search;

$("#invoice").onkeydown = (e) => {

  if (e.key === "Enter") {
    search();
  }

};


async function search() {

  const box = $("#result");

  box.textContent = "Searching…";

  try {

    const o = await j(
      "/api/admin/orders?invoice=" +
      encodeURIComponent($("#invoice").value)
    );

    box.innerHTML = `
      <div class="order">

        <h2>${esc(o.invoice_id)}</h2>

        <p class="muted">
          Created ${new Date(o.created_at).toLocaleString()}
          ·
          Updated ${new Date(o.updated_at).toLocaleString()}
        </p>

        ${o.order_items.map(i => `
          <div class="line">

            <span>
              ${esc(i.name)} × ${i.quantity}
            </span>

            <strong>
              ${i.line_total} ${o.currency}
            </strong>

          </div>
        `).join("")}

        <div class="line">

          <strong>TOTAL</strong>

          <strong>
            ${o.total} ${o.currency}
          </strong>

        </div>

        <p class="muted">
          Discord: ${esc(o.discord_username || "Not provided")}
        </p>

        <p class="muted">
          Note: ${esc(o.note || "None")}
        </p>

        <label>
          Status

          <select id="status">

            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Cancelled</option>

          </select>

        </label>

        <button id="saveStatus">
          SAVE STATUS
        </button>

        <div id="saveMsg" class="muted"></div>

      </div>
    `;

    $("#status").value = o.status;

    $("#saveStatus").onclick = async () => {

      try {

        await j("/api/admin/status", {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            invoice_id: o.invoice_id,
            status: $("#status").value
          })

        });

        $("#saveMsg").textContent =
          "Status saved ✓";

      } catch (e) {

        $("#saveMsg").textContent =
          e.message;

      }

    };

  } catch (e) {

    box.innerHTML =
      `<div class="err">${esc(e.message)}</div>`;

  }

}


function esc(s) {

  return String(s).replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m])
  );

}

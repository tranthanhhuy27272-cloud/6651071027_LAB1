/* =========================
   ShopHuyGamer - script.js
   Xu ly loc, tim kiem, gio hang, giao dien va form demo
   ========================= */

const body = document.body;
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const themeToggle = document.getElementById("themeToggle");
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

let selectedCategory = "all";
let cart = [];
let toastTimer;

// Dinh dang so tien theo tien Viet Nam.
function formatMoney(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

// Hien thong bao nho tren man hinh.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// Mo/ dong menu tren man hinh nho.
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Chuyen giao dien sang/toi.
themeToggle.addEventListener("click", () => {
  body.classList.toggle("light-mode");
  const isLight = body.classList.contains("light-mode");
  themeToggle.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng");
});

// Loc san pham theo danh muc va tu khoa.
const filterButtons = document.querySelectorAll(".filter-button");
const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll(".product-card");
const emptyState = document.getElementById("emptyState");

function filterProducts() {
  const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
  let visibleCount = 0;

  productCards.forEach(card => {
    const categoryMatches = selectedCategory === "all" || card.dataset.category === selectedCategory;
    const text = (card.dataset.name + " " + card.innerText).toLocaleLowerCase("vi");
    const keywordMatches = text.includes(keyword);
    const isVisible = categoryMatches && keywordMatches;

    card.classList.toggle("hidden", !isVisible);
    if (isVisible) visibleCount++;
  });

  emptyState.classList.toggle("hidden", visibleCount > 0);
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.filter;
    filterProducts();
  });
});
searchInput.addEventListener("input", filterProducts);

// Them san pham vao gio hang.
document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        title: button.dataset.title,
        price: Number(button.dataset.price),
        quantity: 1
      });
    }

    renderCart();
    showToast("Đã thêm sản phẩm vào giỏ hàng!");
  });
});

// Ve lai noi dung gio hang sau moi thay doi.
function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatMoney(totalPrice);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Giỏ hàng đang trống. Hãy chọn một sản phẩm nhé!</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-row">
      <div>
        <h3>${escapeHTML(item.title)}</h3>
        <small>${formatMoney(item.price)} / sản phẩm</small>
        <div class="quantity-controls">
          <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Giảm số lượng">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}" aria-label="Tăng số lượng">+</button>
          <button type="button" class="remove-item" data-action="remove" data-id="${item.id}">Xóa</button>
        </div>
      </div>
      <div class="cart-row-price">${formatMoney(item.price * item.quantity)}</div>
    </div>
  `).join("");
}

// Tranh chen ma HTML khi hien ten san pham.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// Xu ly tang/giam/xoa san pham trong gio.
cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = cart.find(product => product.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "increase") item.quantity++;
  if (button.dataset.action === "decrease") item.quantity--;
  if (button.dataset.action === "remove") item.quantity = 0;

  cart = cart.filter(product => product.quantity > 0);
  renderCart();
});

// Mo va dong cua so gio hang.
function openCart() {
  cartModal.classList.remove("hidden");
  body.style.overflow = "hidden";
  closeCart.focus();
}
function hideCart() {
  cartModal.classList.add("hidden");
  body.style.overflow = "";
}
cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", hideCart);
cartModal.addEventListener("click", event => {
  if (event.target === cartModal) hideCart();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !cartModal.classList.contains("hidden")) hideCart();
});

// Nut gui yeu cau dat hang demo.
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Giỏ hàng đang trống!");
    return;
  }

  const orderSummary = cart.map(item => `${item.title} x${item.quantity}`).join(", ");
  hideCart();
  document.getElementById("customerMessage").value =
    `Mình muốn được tư vấn về đơn hàng: ${orderSummary}. Vui lòng xác nhận thông tin và giá trước khi giao dịch.`;
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  document.getElementById("customerName").focus({ preventScroll: true });
  showToast("Đã chuyển thông tin sản phẩm sang biểu mẫu liên hệ.");
});

// Kiem tra form phia trinh duyet; chua gui du lieu len server.
document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const contact = document.getElementById("customerContact").value.trim();
  const message = document.getElementById("customerMessage").value.trim();
  const formMessage = document.getElementById("formMessage");

  if (!name || !contact || !message) {
    formMessage.textContent = "Vui lòng điền đầy đủ thông tin.";
    return;
  }

  formMessage.textContent = "Đã kiểm tra thông tin thành công. Đây là bản demo nên dữ liệu chưa được gửi đi.";
  showToast("Biểu mẫu demo đã được kiểm tra!");
});

// Cap nhat nam hien tai o chan trang.
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Khoi tao gio hang.
renderCart();

"use client";

import { HealthIcon } from "@/app/components/health-icon";
import { useStorefront } from "@/app/components/storefront-provider";
import type {
  BrandStyleTokens,
  ButtonStyle,
  IconBackgroundMode,
  IconStrokeWidth,
  IconTheme,
  LayoutTokens,
  RadiusScale,
  ShapeTheme,
  ThemeTokens,
} from "@/app/config/site";
import { formatPrice } from "@/app/lib/format";
import { signOut, useSession } from "next-auth/react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const toneOptions = [
  "tone-tulsi",
  "tone-ashwagandha",
  "tone-moringa",
  "tone-brahmi",
  "tone-turmeric",
  "tone-neem",
  "tone-triphala",
  "tone-ginger",
];

const themeFields: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: "bg", label: "Background" },
  { key: "paper", label: "Paper" },
  { key: "paperRich", label: "Paper rich" },
  { key: "ink", label: "Ink" },
  { key: "inkSoft", label: "Ink soft" },
  { key: "outline", label: "Outline" },
  { key: "line", label: "Line" },
  { key: "gold", label: "Gold" },
  { key: "goldSoft", label: "Gold soft" },
  { key: "sage", label: "Sage" },
  { key: "clay", label: "Clay" },
  { key: "jade", label: "Jade" },
];

const layoutFields: Array<{
  key: keyof LayoutTokens;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  helper: string;
}> = [
  {
    key: "shellMaxWidthPx",
    label: "Website max width",
    min: 1100,
    max: 1920,
    step: 20,
    unit: "px",
    helper: "Higher means the website uses more screen width.",
  },
  {
    key: "shellSideMarginPx",
    label: "Side margin",
    min: 12,
    max: 140,
    step: 4,
    unit: "px",
    helper: "Higher means more breathing room on both sides.",
  },
  {
    key: "heroMinHeightVh",
    label: "Hero banner height",
    min: 42,
    max: 78,
    step: 1,
    unit: "vh",
    helper: "Controls how much first-screen height the banner uses.",
  },
  {
    key: "cardRadiusPx",
    label: "Box corner radius",
    min: 2,
    max: 24,
    step: 1,
    unit: "px",
    helper: "Lower gives straighter, more normal ecommerce boxes.",
  },
  {
    key: "sectionGapPx",
    label: "Section gap",
    min: 10,
    max: 40,
    step: 1,
    unit: "px",
    helper: "Controls vertical spacing between homepage/shop sections.",
  },
];

const iconThemeOptions: Array<{ value: IconTheme; label: string }> = [
  { value: "botanical-line", label: "Botanical line" },
  { value: "ayurvedic-seal", label: "Ayurvedic seal" },
  { value: "clinical-minimal", label: "Clinical minimal" },
  { value: "premium-mono", label: "Premium mono" },
];

const shapeThemeOptions: Array<{ value: ShapeTheme; label: string }> = [
  { value: "seed", label: "Seed" },
  { value: "leaf", label: "Leaf" },
  { value: "petal", label: "Petal" },
  { value: "stone", label: "Stone" },
  { value: "butterfly", label: "Butterfly" },
];

const iconBackgroundOptions: Array<{ value: IconBackgroundMode; label: string }> = [
  { value: "none", label: "None" },
  { value: "soft", label: "Soft" },
  { value: "solid", label: "Solid" },
];

const radiusScaleOptions: Array<{ value: RadiusScale; label: string }> = [
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "bold", label: "Bold" },
];

const iconStrokeOptions: IconStrokeWidth[] = [1.5, 2, 2.5];
const buttonStyleOptions: Array<{ value: ButtonStyle; label: string }> = [
  { value: "filled-soft", label: "Filled soft" },
  { value: "outline-soft", label: "Outline soft" },
  { value: "text-minimal", label: "Text minimal" },
];

interface BrandPreset {
  id: string;
  label: string;
  description: string;
  brandStyle: Partial<BrandStyleTokens>;
  theme: Partial<ThemeTokens>;
}

const brandPresets: BrandPreset[] = [
  {
    id: "calm-neem",
    label: "Calm Neem",
    description: "Soft green with botanical line icons.",
    brandStyle: {
      iconTheme: "botanical-line",
      shapeTheme: "seed",
      iconBackground: "soft",
      radiusScale: "medium",
      iconStrokeWidth: 2,
      buttonStyle: "filled-soft",
    },
    theme: {
      bg: "#edf3ea",
      paper: "#f8fcf6",
      paperRich: "#e6efe1",
      gold: "#a78e5d",
      sage: "#92a996",
      jade: "#5f7f6c",
    },
  },
  {
    id: "sandal-gold",
    label: "Sandal Gold",
    description: "Premium warm tone with seal-style icons.",
    brandStyle: {
      iconTheme: "ayurvedic-seal",
      shapeTheme: "stone",
      iconBackground: "solid",
      radiusScale: "soft",
      iconStrokeWidth: 2,
      buttonStyle: "outline-soft",
    },
    theme: {
      bg: "#f3eee3",
      paper: "#fffaf0",
      paperRich: "#eee2ce",
      ink: "#2c392f",
      gold: "#b08a58",
      goldSoft: "#dfc79e",
      clay: "#ad7a56",
    },
  },
  {
    id: "forest-ritual",
    label: "Forest Ritual",
    description: "Deep earthy contrast with mono icons.",
    brandStyle: {
      iconTheme: "premium-mono",
      shapeTheme: "leaf",
      iconBackground: "soft",
      radiusScale: "bold",
      iconStrokeWidth: 2.5,
      buttonStyle: "filled-soft",
    },
    theme: {
      bg: "#e8efe8",
      paper: "#f5faf3",
      paperRich: "#dfe9dc",
      ink: "#203127",
      outline: "#5f7465",
      sage: "#88a28d",
      jade: "#547364",
    },
  },
  {
    id: "clay-warmth",
    label: "Clay Warmth",
    description: "Balanced warm palette with minimal icons.",
    brandStyle: {
      iconTheme: "clinical-minimal",
      shapeTheme: "petal",
      iconBackground: "none",
      radiusScale: "medium",
      iconStrokeWidth: 1.5,
      buttonStyle: "text-minimal",
    },
    theme: {
      bg: "#f2ede6",
      paper: "#fdfaf4",
      paperRich: "#e8dfd2",
      ink: "#2f3d34",
      inkSoft: "#59695f",
      gold: "#ad8655",
      clay: "#b07f5f",
    },
  },
];

type AdminRole = "ADMIN" | "SUPER_ADMIN";
type OrderPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
type ShipmentStatus =
  | "NOT_BOOKED"
  | "BOOKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_ATTEMPT"
  | "RTO_INITIATED"
  | "RTO_DELIVERED"
  | "CANCELLED";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: AdminRole;
  createdAt: string;
}

interface AdminOrder {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  addressLine: string;
  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  emailStatus: string;
  shippingProvider: string | null;
  shippingServiceName: string | null;
  shipmentStatus: ShipmentStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shipmentUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminOrderDraft {
  paymentStatus: OrderPaymentStatus;
  shippingProvider: string;
  shippingServiceName: string;
  shipmentStatus: ShipmentStatus;
  trackingNumber: string;
  trackingUrl: string;
}

type OrderFilterState = {
  query: string;
  paymentStatus: "ALL" | OrderPaymentStatus;
  city: string;
  createdFrom: string;
  createdTo: string;
};

const emptyOrderFilters: OrderFilterState = {
  query: "",
  paymentStatus: "ALL",
  city: "",
  createdFrom: "",
  createdTo: "",
};

function parseImageUrlList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function stringifyProductImages(images: string[] | undefined, imageUrl?: string) {
  const combined = [...(images ?? []), imageUrl ?? ""]
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(combined)).join("\n");
}

function buildOrderDraft(order: AdminOrder): AdminOrderDraft {
  return {
    paymentStatus: order.paymentStatus,
    shippingProvider: order.shippingProvider ?? "",
    shippingServiceName: order.shippingServiceName ?? "",
    shipmentStatus: order.shipmentStatus,
    trackingNumber: order.trackingNumber ?? "",
    trackingUrl: order.trackingUrl ?? "",
  };
}

function isOrderDraftDirty(order: AdminOrder, draft: AdminOrderDraft | undefined) {
  if (!draft) {
    return false;
  }

  return (
    draft.paymentStatus !== order.paymentStatus ||
    draft.shippingProvider !== (order.shippingProvider ?? "") ||
    draft.shippingServiceName !== (order.shippingServiceName ?? "") ||
    draft.shipmentStatus !== order.shipmentStatus ||
    draft.trackingNumber !== (order.trackingNumber ?? "") ||
    draft.trackingUrl !== (order.trackingUrl ?? "")
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const {
    state,
    updateTheme,
    resetTheme,
    updateBrandStyle,
    resetBrandStyle,
    updateLayout,
    resetLayout,
    addCategory,
    removeCategory,
    addProduct,
    updateProductImages,
    removeProduct,
    addStory,
    removeStory,
    updateMarketplaces,
    resetMarketplaces,
  } = useStorefront();

  const [categoryInput, setCategoryInput] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    category: state.categories[0] ?? "Herbal Powders",
    imageUrls: "",
    price: "299",
    stock: "20",
    shortDescription: "",
    botanicalName: "",
    unitLabel: "",
    toneClass: toneOptions[0],
  });
  const [productImageDrafts, setProductImageDrafts] = useState<Record<string, string>>({});
  const [productImagesError, setProductImagesError] = useState<string | null>(null);
  const [updatingProductSlug, setUpdatingProductSlug] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({
    name: "",
    city: "",
    quote: "",
    improvement: "",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as AdminRole,
  });
  const [marketplaceForm, setMarketplaceForm] = useState({
    amazonUrl: state.marketplaces.amazonUrl,
    flipkartUrl: state.marketplaces.flipkartUrl,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [updatingOrderNumber, setUpdatingOrderNumber] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, AdminOrderDraft>>({});
  const [orderFilters, setOrderFilters] = useState<OrderFilterState>(emptyOrderFilters);
  const [activeOrderFilters, setActiveOrderFilters] = useState<OrderFilterState>(emptyOrderFilters);
  const categoryStats = useMemo(() => {
    return state.categories.map((category) => ({
      name: category,
      productCount: state.products.filter((product) => product.category === category).length,
    }));
  }, [state.categories, state.products]);
  const safeCategory = state.categories.includes(productForm.category)
    ? productForm.category
    : state.categories[0] ?? "Herbal Powders";
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const orderCityOptions = useMemo(() => {
    return Array.from(new Set(orders.map((order) => order.city.trim()).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [orders]);
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeOrderFilters.paymentStatus !== "ALL") {
        if (order.paymentStatus !== activeOrderFilters.paymentStatus) {
          return false;
        }
      }

      if (activeOrderFilters.city) {
        if (order.city.trim().toLowerCase() !== activeOrderFilters.city.trim().toLowerCase()) {
          return false;
        }
      }

      if (activeOrderFilters.query) {
        const query = activeOrderFilters.query.trim().toLowerCase();
        const haystack = [
          order.orderNumber,
          order.customerName,
          order.email,
          order.phone,
          order.paymentMethod,
          order.shippingProvider ?? "",
          order.shippingServiceName ?? "",
          order.trackingNumber ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      const createdAtTs = new Date(order.createdAt).getTime();
      if (activeOrderFilters.createdFrom) {
        const startTs = new Date(`${activeOrderFilters.createdFrom}T00:00:00`).getTime();
        if (!Number.isNaN(startTs) && createdAtTs < startTs) {
          return false;
        }
      }
      if (activeOrderFilters.createdTo) {
        const endTs = new Date(`${activeOrderFilters.createdTo}T23:59:59`).getTime();
        if (!Number.isNaN(endTs) && createdAtTs > endTs) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeOrderFilters]);

  const loadAdminUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        users?: AdminUser[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load admin users.");
      }

      setUsers(payload.users ?? []);
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Failed to load admin users.",
      );
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminUsers();
  }, [loadAdminUsers]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await fetch("/api/admin/orders?limit=120", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        orders?: AdminOrder[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load orders.");
      }

      const nextOrders = payload.orders ?? [];
      setOrders(nextOrders);
      setOrderDrafts(
        nextOrders.reduce<Record<string, AdminOrderDraft>>((acc, order) => {
          acc[order.orderNumber] = buildOrderDraft(order);
          return acc;
        }, {}),
      );
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setMarketplaceForm({
      amazonUrl: state.marketplaces.amazonUrl,
      flipkartUrl: state.marketplaces.flipkartUrl,
    });
  }, [state.marketplaces.amazonUrl, state.marketplaces.flipkartUrl]);

  useEffect(() => {
    setProductImageDrafts((prev) => {
      const next: Record<string, string> = {};
      for (const product of state.products) {
        next[product.id] =
          prev[product.id] ?? stringifyProductImages(product.images, product.imageUrl);
      }
      return next;
    });
  }, [state.products]);

  const reorderProductImageDraft = (productId: string, index: number, direction: -1 | 1) => {
    setProductImageDrafts((prev) => {
      const current = parseImageUrlList(prev[productId] ?? "");
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return prev;
      }
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return {
        ...prev,
        [productId]: next.join("\n"),
      };
    });
  };

  const saveProductImages = async (productId: string, productSlug: string) => {
    const images = parseImageUrlList(productImageDrafts[productId] ?? "");
    if (!images.length) {
      setProductImagesError("Add at least one valid image URL before saving.");
      return;
    }

    setProductImagesError(null);
    setUpdatingProductSlug(productSlug);

    const response = await fetch(`/api/admin/products/${encodeURIComponent(productSlug)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          product?: {
            slug: string;
            images: string[];
          };
        }
      | null;

    setUpdatingProductSlug(null);

    if (!response.ok || !payload?.product) {
      setProductImagesError(payload?.error ?? "Failed to save product images.");
      return;
    }

    const savedProduct = payload.product;
    updateProductImages(productId, savedProduct.images);
    setProductImageDrafts((prev) => ({
      ...prev,
      [productId]: savedProduct.images.join("\n"),
    }));
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsersError(null);
    setIsCreatingUser(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userForm),
    });

    const payload = (await response.json()) as { error?: string };
    setIsCreatingUser(false);

    if (!response.ok) {
      setUsersError(payload.error ?? "Failed to create admin user.");
      return;
    }

    setUserForm((prev) => ({
      ...prev,
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    }));
    await loadAdminUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    setUsersError(null);
    setDeletingUserId(userId);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };
    setDeletingUserId(null);

    if (!response.ok) {
      setUsersError(payload.error ?? "Failed to remove admin user.");
      return;
    }

    await loadAdminUsers();
  };

  const handleSaveOrder = async (order: AdminOrder) => {
    const draft = orderDrafts[order.orderNumber] ?? buildOrderDraft(order);
    if (!isOrderDraftDirty(order, draft)) {
      return;
    }

    setOrdersError(null);
    setUpdatingOrderNumber(order.orderNumber);

    const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentStatus: draft.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingProvider:
          draft.shippingProvider !== (order.shippingProvider ?? "")
            ? draft.shippingProvider || undefined
            : undefined,
        shippingServiceName:
          draft.shippingServiceName !== (order.shippingServiceName ?? "")
            ? draft.shippingServiceName || undefined
            : undefined,
        shipmentStatus:
          draft.shipmentStatus !== order.shipmentStatus ? draft.shipmentStatus : undefined,
        trackingNumber:
          draft.trackingNumber !== (order.trackingNumber ?? "")
            ? draft.trackingNumber || undefined
            : undefined,
        trackingUrl:
          draft.trackingUrl !== (order.trackingUrl ?? "")
            ? draft.trackingUrl || undefined
            : undefined,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      order?: AdminOrder;
    };

    setUpdatingOrderNumber(null);

    if (!response.ok || !payload.order) {
      setOrdersError(payload.error ?? "Failed to update order status.");
      return;
    }

    setOrders((prev) =>
      prev.map((item) => (item.orderNumber === payload.order?.orderNumber ? payload.order : item)),
    );
    setOrderDrafts((prev) => ({
      ...prev,
      [order.orderNumber]: payload.order ? buildOrderDraft(payload.order) : draft,
    }));
  };

  const applyBrandPreset = (preset: BrandPreset) => {
    updateTheme(preset.theme);
    updateBrandStyle(preset.brandStyle);
  };

  const isPresetActive = (preset: BrandPreset) => {
    return Object.entries(preset.brandStyle).every(([key, value]) => {
      return state.brandStyle[key as keyof BrandStyleTokens] === value;
    });
  };

  return (
    <div className="page-stack admin-viewport">
      <section className="section-card reveal reveal-delay-1">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin portal</p>
            <h1 className="page-title">Store controls</h1>
            <p className="page-subtitle">
              Signed in as {session?.user?.email ?? "admin"} ({session?.user?.role ?? "ADMIN"}).
              Manage theme, categories, products, stories, users, and order payments.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-1">
        <h2>Admin users</h2>
        <p className="admin-helper">
          Keep one codebase. Add up to 4 family admins here. Only super admin can remove users or create another super admin.
        </p>
        <form className="admin-grid-form" onSubmit={handleCreateUser}>
          <label>
            Full name
            <input
              required
              value={userForm.name}
              onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={userForm.password}
              onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          <label>
            Role
            <select
              value={userForm.role}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, role: event.target.value as AdminRole }))
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN" disabled={!isSuperAdmin}>
                SUPER_ADMIN
              </option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary field-span-2" disabled={isCreatingUser}>
            {isCreatingUser ? "Adding user..." : "Add admin user"}
          </button>
        </form>

        {usersError ? <p className="form-error">{usersError}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Added on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={5}>Loading admin users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5}>No admin users found.</td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user.id === session?.user?.id;
                  const disableRemove = !isSuperAdmin || isCurrentUser;
                  return (
                    <tr key={user.id}>
                      <td>{user.name ?? "Admin user"}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="text-btn"
                          disabled={disableRemove || deletingUserId === user.id}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          {deletingUserId === user.id ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-1">
        <div className="section-head">
          <h2>Theme customization</h2>
          <button type="button" className="btn btn-outline" onClick={resetTheme}>
            Reset theme
          </button>
        </div>
        <div className="theme-grid">
          {themeFields.map((field) => (
            <label key={field.key} className="theme-input">
              {field.label}
              <input
                type="color"
                value={state.theme[field.key]}
                onChange={(event) =>
                  updateTheme({ [field.key]: event.target.value } as Partial<ThemeTokens>)
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        <div className="section-head">
          <h2>Layout spacing controls</h2>
          <button type="button" className="btn btn-outline" onClick={resetLayout}>
            Reset layout
          </button>
        </div>
        <p className="admin-helper">
          Tune website width, side margin, hero height, box corners, and section spacing live.
          This lets you test proper margins without editing code every time.
        </p>
        <div className="layout-control-grid">
          {layoutFields.map((field) => (
            <label key={field.key} className="layout-control">
              <span>
                {field.label}
                <strong>
                  {state.layout[field.key]}
                  {field.unit}
                </strong>
              </span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={state.layout[field.key]}
                onChange={(event) =>
                  updateLayout({
                    [field.key]: Number(event.target.value),
                  } as Partial<LayoutTokens>)
                }
              />
              <small>{field.helper}</small>
            </label>
          ))}
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        <div className="section-head">
          <h2>Brand style controls</h2>
          <button type="button" className="btn btn-outline" onClick={resetBrandStyle}>
            Reset style
          </button>
        </div>
        <p className="admin-helper">
          Customize icon personality, icon shapes, and rounded geometry. Changes apply live across the storefront.
        </p>

        <div className="preset-grid">
          {brandPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={isPresetActive(preset) ? "preset-btn is-active" : "preset-btn"}
              onClick={() => applyBrandPreset(preset)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>

        <div className="admin-grid-form style-grid-form">
          <label>
            Icon theme
            <select
              value={state.brandStyle.iconTheme}
              onChange={(event) =>
                updateBrandStyle({
                  iconTheme: event.target.value as IconTheme,
                })
              }
            >
              {iconThemeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Shape style
            <select
              value={state.brandStyle.shapeTheme}
              onChange={(event) =>
                updateBrandStyle({
                  shapeTheme: event.target.value as ShapeTheme,
                })
              }
            >
              {shapeThemeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Icon background
            <select
              value={state.brandStyle.iconBackground}
              onChange={(event) =>
                updateBrandStyle({
                  iconBackground: event.target.value as IconBackgroundMode,
                })
              }
            >
              {iconBackgroundOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Radius scale
            <select
              value={state.brandStyle.radiusScale}
              onChange={(event) =>
                updateBrandStyle({
                  radiusScale: event.target.value as RadiusScale,
                })
              }
            >
              {radiusScaleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Button style
            <select
              value={state.brandStyle.buttonStyle}
              onChange={(event) =>
                updateBrandStyle({
                  buttonStyle: event.target.value as ButtonStyle,
                })
              }
            >
              {buttonStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-span-2">
            Icon stroke width
            <select
              value={String(state.brandStyle.iconStrokeWidth)}
              onChange={(event) =>
                updateBrandStyle({
                  iconStrokeWidth: Number(event.target.value) as IconStrokeWidth,
                })
              }
            >
              {iconStrokeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="style-preview-grid">
          <article className="style-preview-card">
            <span className="icon-badge" aria-hidden="true">
              <HealthIcon name="leaf" size={16} />
            </span>
            <h3>Calm daily ritual</h3>
            <p>Icon style preview for trust cards and homepage badges.</p>
          </article>
          <article className="style-preview-card">
            <span className="icon-badge icon-badge--goal" aria-hidden="true">
              <HealthIcon name="flask" size={16} />
            </span>
            <h3>Purity and wellness science</h3>
            <p>Shape and stroke preview for category and product blocks.</p>
          </article>
          <article className="style-preview-card">
            <span className="icon-badge" aria-hidden="true">
              <HealthIcon name="heart-pulse" size={16} />
            </span>
            <h3>Healthy outcomes</h3>
            <p>Theme should feel premium, natural, and trustworthy.</p>
          </article>
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        <div className="section-head">
          <h2>Marketplace links</h2>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              resetMarketplaces();
            }}
          >
            Reset links
          </button>
        </div>
        <p className="admin-helper">
          Add your store listing URLs so customers can also shop on Amazon and Flipkart.
        </p>
        <form
          className="admin-grid-form"
          onSubmit={(event) => {
            event.preventDefault();
            updateMarketplaces({
              amazonUrl: marketplaceForm.amazonUrl,
              flipkartUrl: marketplaceForm.flipkartUrl,
            });
          }}
        >
          <label>
            Amazon store URL
            <input
              type="url"
              placeholder="https://www.amazon.in/shops/your-store"
              value={marketplaceForm.amazonUrl}
              onChange={(event) =>
                setMarketplaceForm((prev) => ({ ...prev, amazonUrl: event.target.value }))
              }
            />
          </label>
          <label>
            Flipkart store URL
            <input
              type="url"
              placeholder="https://www.flipkart.com/seller/your-store"
              value={marketplaceForm.flipkartUrl}
              onChange={(event) =>
                setMarketplaceForm((prev) => ({ ...prev, flipkartUrl: event.target.value }))
              }
            />
          </label>
          <button type="submit" className="btn btn-primary field-span-2">
            Save marketplace links
          </button>
        </form>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        <h2>Categories</h2>
        <p className="admin-helper">
          These categories power your shop sidebar and product filters.
        </p>
        <form
          className="admin-inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            addCategory(categoryInput);
            setCategoryInput("");
          }}
        >
          <input
            placeholder="Add category"
            value={categoryInput}
            onChange={(event) => setCategoryInput(event.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((category) => (
                <tr key={category.name}>
                  <td>{category.name}</td>
                  <td>{category.productCount}</td>
                  <td>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => removeCategory(category.name)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-2">
        <h2>Products</h2>
        {productImagesError ? <p className="form-error">{productImagesError}</p> : null}
        <form
          className="admin-grid-form"
          onSubmit={(event) => {
            event.preventDefault();
            addProduct({
              name: productForm.name,
              category: safeCategory,
              imageUrls: parseImageUrlList(productForm.imageUrls),
              price: Number(productForm.price),
              stock: Number(productForm.stock),
              shortDescription: productForm.shortDescription,
              botanicalName: productForm.botanicalName,
              unitLabel: productForm.unitLabel,
              toneClass: productForm.toneClass,
            });
            setProductForm({
              name: "",
              category: state.categories[0] ?? "Herbal Powders",
              imageUrls: "",
              price: "299",
              stock: "20",
              shortDescription: "",
              botanicalName: "",
              unitLabel: "",
              toneClass: toneOptions[0],
            });
          }}
        >
          <label>
            Product name
            <input
              required
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            Category
            <select
              value={safeCategory}
              onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              {state.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field-span-2">
            Product image URLs (up to 5)
            <textarea
              rows={4}
              placeholder={[
                "https://ik.imagekit.io/your-store/products/product-1.jpg",
                "https://ik.imagekit.io/your-store/products/product-2.jpg",
                "https://ik.imagekit.io/your-store/products/product-3.jpg",
              ].join("\n")}
              value={productForm.imageUrls}
              onChange={(event) =>
                setProductForm((prev) => ({ ...prev, imageUrls: event.target.value }))
              }
            />
          </label>
          <label>
            Price
            <input
              type="number"
              min={1}
              required
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              min={0}
              required
              value={productForm.stock}
              onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
            />
          </label>
          <label className="field-span-2">
            Short description
            <input
              required
              value={productForm.shortDescription}
              onChange={(event) =>
                setProductForm((prev) => ({ ...prev, shortDescription: event.target.value }))
              }
            />
          </label>
          <label>
            Botanical name
            <input
              value={productForm.botanicalName}
              onChange={(event) =>
                setProductForm((prev) => ({ ...prev, botanicalName: event.target.value }))
              }
            />
          </label>
          <label>
            Unit label
            <input
              value={productForm.unitLabel}
              onChange={(event) => setProductForm((prev) => ({ ...prev, unitLabel: event.target.value }))}
            />
          </label>
          <label className="field-span-2">
            Card tone
            <select
              value={productForm.toneClass}
              onChange={(event) => setProductForm((prev) => ({ ...prev, toneClass: event.target.value }))}
            >
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary field-span-2">
            Add product
          </button>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Images & order</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <div className="admin-product-images">
                      <textarea
                        rows={4}
                        placeholder="Paste one URL, comma-separated URLs, or one URL per line"
                        value={
                          productImageDrafts[product.id] ??
                          stringifyProductImages(product.images, product.imageUrl)
                        }
                        onChange={(event) =>
                          setProductImageDrafts((prev) => ({
                            ...prev,
                            [product.id]: event.target.value,
                          }))
                        }
                      />
                      <div className="admin-image-order-list">
                        {parseImageUrlList(productImageDrafts[product.id] ?? "").map(
                          (imageUrl, index, imageList) => (
                            <div key={`${product.id}-${imageUrl}`} className="admin-image-order-row">
                              <span>
                                {index === 0 ? "Main" : `Image ${index + 1}`}
                              </span>
                              <code>{imageUrl}</code>
                              <button
                                type="button"
                                className="text-btn"
                                disabled={index === 0}
                                onClick={() => reorderProductImageDraft(product.id, index, -1)}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                className="text-btn"
                                disabled={index === imageList.length - 1}
                                onClick={() => reorderProductImageDraft(product.id, index, 1)}
                              >
                                Down
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="admin-product-image-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={updatingProductSlug === product.slug}
                          onClick={() => saveProductImages(product.id, product.slug)}
                        >
                          {updatingProductSlug === product.slug ? "Saving..." : "Save images"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            setProductImageDrafts((prev) => ({
                              ...prev,
                              [product.id]: stringifyProductImages(product.images, product.imageUrl),
                            }))
                          }
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button type="button" className="text-btn" onClick={() => removeProduct(product.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-3">
        <h2>Customer satisfaction reviews</h2>
        <form
          className="admin-grid-form"
          onSubmit={(event) => {
            event.preventDefault();
            addStory(storyForm);
            setStoryForm({ name: "", city: "", quote: "", improvement: "" });
          }}
        >
          <label>
            Name
            <input
              required
              value={storyForm.name}
              onChange={(event) => setStoryForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            City
            <input
              value={storyForm.city}
              onChange={(event) => setStoryForm((prev) => ({ ...prev, city: event.target.value }))}
            />
          </label>
          <label className="field-span-2">
            Review quote
            <input
              required
              value={storyForm.quote}
              onChange={(event) => setStoryForm((prev) => ({ ...prev, quote: event.target.value }))}
            />
          </label>
          <label className="field-span-2">
            Result
            <input
              value={storyForm.improvement}
              onChange={(event) =>
                setStoryForm((prev) => ({ ...prev, improvement: event.target.value }))
              }
            />
          </label>
          <button type="submit" className="btn btn-primary field-span-2">
            Add review
          </button>
        </form>

        <div className="admin-list">
          {state.stories.map((story) => (
            <article key={story.id} className="story-card">
              <p>{story.quote}</p>
              <strong>
                {story.name}, {story.city}
              </strong>
              <span>{story.improvement}</span>
              <button type="button" className="text-btn" onClick={() => removeStory(story.id)}>
                Remove review
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card admin-section reveal reveal-delay-3">
        <div className="section-head">
          <h2>Orders & payment status</h2>
          <button type="button" className="btn btn-outline" onClick={() => void loadOrders()}>
            Refresh
          </button>
        </div>
        <form
          className="admin-filter-shell"
          onSubmit={(event) => {
            event.preventDefault();
            setActiveOrderFilters(orderFilters);
          }}
        >
          <label className="admin-filter-field">
            Search order/customer
            <input
              type="text"
              placeholder="Order ID, name, phone, email"
              value={orderFilters.query}
              onChange={(event) =>
                setOrderFilters((prev) => ({
                  ...prev,
                  query: event.target.value,
                }))
              }
            />
          </label>
          <label className="admin-filter-field">
            Payment status
            <select
              value={orderFilters.paymentStatus}
              onChange={(event) =>
                setOrderFilters((prev) => ({
                  ...prev,
                  paymentStatus: event.target.value as OrderFilterState["paymentStatus"],
                }))
              }
            >
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </label>
          <label className="admin-filter-field">
            City
            <select
              value={orderFilters.city}
              onChange={(event) =>
                setOrderFilters((prev) => ({
                  ...prev,
                  city: event.target.value,
                }))
              }
            >
              <option value="">All cities</option>
              {orderCityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-filter-field">
            From date
            <input
              type="date"
              value={orderFilters.createdFrom}
              onChange={(event) =>
                setOrderFilters((prev) => ({
                  ...prev,
                  createdFrom: event.target.value,
                }))
              }
            />
          </label>
          <label className="admin-filter-field">
            To date
            <input
              type="date"
              value={orderFilters.createdTo}
              onChange={(event) =>
                setOrderFilters((prev) => ({
                  ...prev,
                  createdTo: event.target.value,
                }))
              }
            />
          </label>
          <button type="submit" className="btn btn-primary admin-filter-action">
            Apply filter
          </button>
          <button
            type="button"
            className="btn btn-outline admin-filter-action"
            onClick={() => {
              setOrderFilters(emptyOrderFilters);
              setActiveOrderFilters(emptyOrderFilters);
            }}
          >
            Reset
          </button>
        </form>
        <p className="admin-helper">
          Showing {filteredOrders.length} of {orders.length} orders.
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--pastel">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Payment</th>
                <th>Shipping</th>
                <th>Tracking</th>
                <th>Email</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={10}>Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10}>No matching orders for this filter.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>
                      <strong>{new Date(order.createdAt).toLocaleString()}</strong>
                      {order.shipmentUpdatedAt ? (
                        <>
                          <br />
                          <span className="admin-inline-note">
                            Ship: {new Date(order.shipmentUpdatedAt).toLocaleString()}
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td>{order.orderNumber}</td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <br />
                      <span>{order.email}</span>
                    </td>
                    <td>
                      {order.city}, {order.state}
                    </td>
                    <td>
                      <strong>{order.paymentMethod}</strong>
                      <br />
                      <select
                        value={
                          orderDrafts[order.orderNumber]?.paymentStatus ?? order.paymentStatus
                        }
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              paymentStatus: event.target.value as OrderPaymentStatus,
                            },
                          }))
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="admin-order-inline-input"
                        placeholder="Provider e.g. Shiprocket"
                        value={orderDrafts[order.orderNumber]?.shippingProvider ?? ""}
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              shippingProvider: event.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        className="admin-order-inline-input"
                        placeholder="Service name"
                        value={orderDrafts[order.orderNumber]?.shippingServiceName ?? ""}
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              shippingServiceName: event.target.value,
                            },
                          }))
                        }
                      />
                      <select
                        value={orderDrafts[order.orderNumber]?.shipmentStatus ?? order.shipmentStatus}
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              shipmentStatus: event.target.value as ShipmentStatus,
                            },
                          }))
                        }
                      >
                        <option value="NOT_BOOKED">NOT_BOOKED</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="PICKED_UP">PICKED_UP</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="FAILED_ATTEMPT">FAILED_ATTEMPT</option>
                        <option value="RTO_INITIATED">RTO_INITIATED</option>
                        <option value="RTO_DELIVERED">RTO_DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="admin-order-inline-input"
                        placeholder="Tracking number"
                        value={orderDrafts[order.orderNumber]?.trackingNumber ?? ""}
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              trackingNumber: event.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        className="admin-order-inline-input"
                        placeholder="https://tracking-link"
                        value={orderDrafts[order.orderNumber]?.trackingUrl ?? ""}
                        onChange={(event) =>
                          setOrderDrafts((prev) => ({
                            ...prev,
                            [order.orderNumber]: {
                              ...(prev[order.orderNumber] ?? buildOrderDraft(order)),
                              trackingUrl: event.target.value,
                            },
                          }))
                        }
                      />
                      {order.trackingUrl ? (
                        <a
                          className="admin-inline-link"
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open tracking link
                        </a>
                      ) : null}
                    </td>
                    <td>
                      <strong>{order.emailStatus}</strong>
                      <br />
                      <span className="admin-inline-note">{order.email}</span>
                    </td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <button
                        type="button"
                        className="text-btn"
                        disabled={
                          updatingOrderNumber === order.orderNumber ||
                          !isOrderDraftDirty(order, orderDrafts[order.orderNumber])
                        }
                        onClick={() => void handleSaveOrder(order)}
                      >
                        {updatingOrderNumber === order.orderNumber ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {ordersError ? <p className="form-error">{ordersError}</p> : null}
      </section>
    </div>
  );
}

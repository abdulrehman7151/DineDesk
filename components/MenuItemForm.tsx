"use client";

import React, {
    useActionState,
    useState,
    useEffect,
    useRef,
} from "react";

import Link from "next/link";


const categories = [
    "Burgers",
    "Pizza",
    "Pasta",
    "Chicken",
    "Drinks",
    "Desserts",
];


const SIZE_SUGGESTIONS = [
    "Small",
    "Medium",
    "Large",
    "Extra Large",
    "Regular",
    "Family",
    "Half",
    "Full",
    "6 Inch",
    "9 Inch",
    "12 Inch",
    "Single",
    "Double",
];


const QUICK_TEMPLATES = {

    pizza: [
        { name: "Small", price: "" },
        { name: "Medium", price: "" },
        { name: "Large", price: "" },
    ],

    drink: [
        { name: "Regular", price: "" },
        { name: "Large", price: "" },
    ],

    portion: [
        { name: "Half", price: "" },
        { name: "Full", price: "" },
    ],

};


// =========================
// TYPES
// =========================

export type MenuItemForForm = {
    id: number;
    ProductName: string;
    category: string;
    description: string | null;
    imageUrl: string | null;
    isAvailable: boolean;
    basePrice: number | null;
    sizes: {
        id: number;
        Size: string;
        price: number;
    }[];
};

export type MenuFormState = {
    success: boolean;
    message: string;
};

type MenuItemFormProps = {
    mode: "add" | "edit";
    item?: MenuItemForForm | null;
    action: (
        prevState: MenuFormState,
        formData: FormData
    ) => Promise<MenuFormState>;
};


// =========================
// COMPONENT
// =========================

export default function MenuItemForm({
    mode,
    item = null,
    action,
}: MenuItemFormProps) {

    const isEdit = mode === "edit";


    // =========================
    // Initial action state
    // =========================

    const initialState: MenuFormState = {
        success: false,
        message: "",
    };


    // =========================
    // React state
    // =========================

    const [hasSizes, setHasSizes] = useState(
        isEdit ? (item?.sizes?.length ?? 0) > 0 : false
    );

    const [sizes, setSizes] = useState<
        {
            name: string;
            price: string;
        }[]
    >(
        isEdit && item
            ? item.sizes.map((s) => ({
                name: s.Size,
                price: String(s.price),
            }))
            : []
    );


    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        action,
        initialState
    );


    // Image preview state
    const [imagePreview, setImagePreview] = useState<string | null>(
        isEdit ? item?.imageUrl ?? null : null
    );
    const [imageName, setImageName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Cleanup preview URL on unmount
    // NOTE: only revoke URLs we created (blob:), not remote ones
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


    // Handle file selection
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(isEdit ? item?.imageUrl ?? null : null);
            setImageName(null);
            return;
        }

        if (imagePreview && imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        const url = URL.createObjectURL(file);

        setImagePreview(url);
        setImageName(file.name);
    };


    // Remove selected image
    const clearImage = () => {
        if (imagePreview && imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview(null);
        setImageName(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const addSizeRow = () => {
        setSizes([
            ...sizes,
            {
                name: "",
                price: "",
            },
        ]);
    };


    const removeSizeRow = (index: number) => {
        const updatedSizes = sizes.filter((_, i) => i !== index);
        setSizes(updatedSizes);
    };


    const updateSize = (
        index: number,
        field: "name" | "price",
        value: string
    ) => {
        const updatedSizes = [...sizes];
        updatedSizes[index][field] = value;
        setSizes(updatedSizes);
    };


    const applyTemplate = (
        templateKey: keyof typeof QUICK_TEMPLATES
    ) => {
        setSizes(QUICK_TEMPLATES[templateKey]);
    };


    return (

        <div className="space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2 mb-1">

                        <Link
                            href="/admin/menu"
                            className="text-sm font-medium text-ink-soft hover:text-brand transition flex items-center gap-1"
                        >

                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>

                            Back to Menu

                        </Link>

                    </div>


                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? "Edit Item" : "Add New Item"}
                    </h1>


                    <p className="mt-1 text-sm text-ink-soft">
                        {isEdit
                            ? "Update the details of this menu item."
                            : "Create a new dish or drink to add to your restaurant's menu."}
                    </p>

                </div>

            </div>


            {/* Form Card */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-soft sm:p-8">

                <form
                    className="space-y-8"
                    action={formAction}
                >

                    {/* Hidden id (for edit mode) */}
                    {isEdit && item && (
                        <input
                            type="hidden"
                            name="id"
                            value={item.id}
                        />
                    )}

                    {/* Existing image URL (for edit mode) */}
                    {isEdit && item?.imageUrl && (
                        <input
                            type="hidden"
                            name="existingImageUrl"
                            value={item.imageUrl}
                        />
                    )}


                    {/* Item Details */}
                    <div className="space-y-5">

                        <h2 className="text-base font-bold text-ink border-b border-hairline pb-3">
                            Item Details
                        </h2>


                        <div className="grid gap-4 sm:grid-cols-2">

                            {/* Name */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-sm font-semibold text-ink"
                                >
                                    Item Name{" "}
                                    <span className="text-brand">
                                        *
                                    </span>
                                </label>


                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={item?.ProductName ?? ""}
                                    placeholder="e.g. Classic Beef Burger"
                                    className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                                />

                            </div>


                            {/* Category */}
                            <div>

                                <label
                                    htmlFor="category"
                                    className="mb-1.5 block text-sm font-semibold text-ink"
                                >
                                    Category{" "}
                                    <span className="text-brand">
                                        *
                                    </span>
                                </label>


                                <select
                                    id="category"
                                    name="category"
                                    defaultValue={item?.category ?? ""}
                                    className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                                >

                                    <option value="">
                                        Select a category
                                    </option>

                                    {categories.map(
                                        (cat) => (
                                            <option
                                                key={cat}
                                                value={cat}
                                            >
                                                {cat}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Size Toggle */}
                            <div className="flex items-center h-full pt-6">

                                <label className="flex items-center gap-3 cursor-pointer">

                                    <div className="relative">

                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={hasSizes}
                                            onChange={(e) => {

                                                setHasSizes(
                                                    e.target.checked
                                                );

                                                if (
                                                    !e.target.checked
                                                ) {
                                                    setSizes([]);
                                                }

                                            }}
                                        />


                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand">
                                        </div>

                                    </div>


                                    <div>

                                        <span className="text-sm font-semibold text-ink block">
                                            Has Sizes / Variants?
                                        </span>

                                        <span className="text-xs text-ink-muted">
                                            e.g. Small, Medium, Large
                                        </span>

                                    </div>

                                </label>

                            </div>


                            {/* Single Price */}
                            {!hasSizes && (

                                <div>

                                    <label
                                        htmlFor="price"
                                        className="mb-1.5 block text-sm font-semibold text-ink"
                                    >
                                        Price (Rs.){" "}
                                        <span className="text-brand">
                                            *
                                        </span>
                                    </label>


                                    <div className="relative">

                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-soft">
                                            Rs.
                                        </span>


                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="1"
                                            defaultValue={item?.basePrice ?? ""}
                                            placeholder="850"
                                            className="w-full rounded-xl border border-hairline bg-surface-tint pl-10 pr-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                                        />

                                    </div>

                                </div>

                            )}


                            {/* Description */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-semibold text-ink"
                                >
                                    Description
                                </label>


                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={item?.description ?? ""}
                                    placeholder="Describe the ingredients and taste of this item..."
                                    className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft resize-none"
                                />

                            </div>

                        </div>

                    </div>


                    {/* Sizes */}
                    {hasSizes && (

                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">


                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-3 gap-3">

                                <h2 className="text-base font-bold text-ink">
                                    Sizes & Pricing
                                </h2>


                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            applyTemplate(
                                                "pizza"
                                            )
                                        }
                                        className="text-[10px] font-bold text-ink-soft hover:text-brand border border-hairline px-2 py-1 rounded-md transition"
                                    >
                                        + Pizza Sizes
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            applyTemplate(
                                                "drink"
                                            )
                                        }
                                        className="text-[10px] font-bold text-ink-soft hover:text-brand border border-hairline px-2 py-1 rounded-md transition"
                                    >
                                        + Drink Sizes
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            applyTemplate(
                                                "portion"
                                            )
                                        }
                                        className="text-[10px] font-bold text-ink-soft hover:text-brand border border-hairline px-2 py-1 rounded-md transition"
                                    >
                                        + Portion Sizes
                                    </button>

                                </div>

                            </div>


                            <div className="space-y-3">

                                {sizes.map(
                                    (
                                        size,
                                        index
                                    ) => (

                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >


                                            {/* Size Name */}

                                            <div className="flex-1">

                                                <input
                                                    type="text"
                                                    placeholder="Size name (e.g. Small)"
                                                    list="size-suggestions"
                                                    value={
                                                        size.name
                                                    }
                                                    onChange={(e) =>
                                                        updateSize(
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                                                />

                                            </div>


                                            {/* Price */}

                                            <div className="relative w-32">

                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-soft">
                                                    Rs.
                                                </span>


                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    value={
                                                        size.price
                                                    }
                                                    onChange={(e) =>
                                                        updateSize(
                                                            index,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-hairline bg-surface-tint pl-8 pr-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft"
                                                />

                                            </div>


                                            {/* Remove */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSizeRow(
                                                        index
                                                    )
                                                }
                                                className="p-2.5 text-ink-muted hover:text-brand hover:bg-brand-soft rounded-xl transition"
                                            >

                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="flex items-center justify-between">

                                <button
                                    type="button"
                                    onClick={addSizeRow}
                                    className="text-xs font-bold text-brand hover:text-brand-deep flex items-center gap-1"
                                >

                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>

                                    Add Custom Size

                                </button>


                                <p className="text-xs text-ink-muted">
                                    * Customer will choose one of these sizes.
                                </p>

                            </div>


                            <datalist id="size-suggestions">

                                {SIZE_SUGGESTIONS.map(
                                    (s) => (

                                        <option
                                            key={s}
                                            value={s}
                                        />

                                    )
                                )}

                            </datalist>

                        </div>

                    )}


                    {/* IMAGE SECTION */}
                    <div className="space-y-5">

                        <h2 className="text-base font-bold text-ink border-b border-hairline pb-3">
                            Item Image
                        </h2>


                        <div className="flex flex-col sm:flex-row gap-6 items-start">


                            {/* Preview */}
                            <div className="relative w-full sm:w-48 h-48 rounded-2xl border-2 border-dashed border-hairline bg-surface-tint flex flex-col items-center justify-center text-ink-muted shrink-0 overflow-hidden">

                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Selected preview"
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />

                                        {/* Remove button overlay */}
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            aria-label="Remove image"
                                            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                                        >
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-8 h-8 mb-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>

                                        <span className="text-xs font-medium">
                                            Preview
                                        </span>
                                    </>
                                )}

                            </div>


                            {/* Upload */}
                            <div className="flex-1 w-full space-y-3">

                                <label className="block text-sm font-semibold text-ink">
                                    {isEdit ? "Replace Image (optional)" : "Upload Image"}
                                </label>


                                <div className="flex items-center justify-center w-full">

                                    <label
                                        htmlFor="dropzone-file"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-hairline border-dashed rounded-xl cursor-pointer bg-surface-tint hover:bg-surface-warm transition"
                                    >

                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">

                                            <svg
                                                className="w-6 h-6 mb-2 text-ink-muted"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>


                                            <p className="mb-1 text-xs text-ink-soft">

                                                <span className="font-semibold text-brand">
                                                    Click to upload
                                                </span>

                                                {" "}or drag and drop

                                            </p>


                                            <p className="text-[10px] text-ink-muted">
                                                PNG, JPG or WEBP (MAX. 2MB)
                                            </p>

                                        </div>


                                        <input
                                            ref={fileInputRef}
                                            id="dropzone-file"
                                            name="image"
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                        />

                                    </label>

                                </div>


                                {/* Selected filename + clear */}
                                {imageName && (
                                    <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface-tint px-3 py-2 text-xs">
                                        <span className="truncate font-medium text-ink">
                                            {imageName}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="ml-3 shrink-0 font-bold text-brand hover:text-brand-deep"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* Availability */}
                    <div className="space-y-5">

                        <h2 className="text-base font-bold text-ink border-b border-hairline pb-3">
                            Availability
                        </h2>


                        <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface-tint p-4">

                            <div>

                                <p className="text-sm font-semibold text-ink">
                                    Item is Available
                                </p>

                                <p className="text-xs text-ink-soft mt-0.5">
                                    Toggle this off to hide the item from the customer menu.
                                </p>

                            </div>


                            <label className="relative inline-flex items-center cursor-pointer">

                                <input
                                    type="checkbox"
                                    defaultChecked={item?.isAvailable ?? true}
                                    className="sr-only peer"
                                    name="isAvailable"
                                />


                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand">
                                </div>

                            </label>

                        </div>

                    </div>


                    {/* Hidden values */}
                    <input
                        type="hidden"
                        name="hasSizes"
                        value={
                            hasSizes
                                ? "true"
                                : "false"
                        }
                    />


                    <input
                        type="hidden"
                        name="sizes"
                        value={JSON.stringify(sizes)}
                    />


                    {/* Error / Success message */}
                    {state.message && (

                        <div
                            className={
                                state.success
                                    ? "rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
                                    : "rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                            }
                        >
                            {state.message}
                        </div>

                    )}


                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-hairline pt-6">


                        <Link
                            href="/admin/menu"
                            className="w-full sm:w-auto rounded-full border border-hairline bg-surface-tint px-6 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand text-center"
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto rounded-full bg-brand px-8 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {isPending
                                ? "Saving..."
                                : isEdit
                                    ? "Update Item"
                                    : "Save Item"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}
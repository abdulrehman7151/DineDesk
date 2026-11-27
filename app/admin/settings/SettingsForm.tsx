"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import {
    updateRestaurantSettings,
    type RestaurantSettingsState,
} from "@/actions/restaurantSettings";

type SettingsValues = {
    name: string;
    city: string;
    address: string;
    phone: string;
    openingTime: string;
    closingTime: string;
    servedAutoCloseMinutes: string;
};

const initialState: RestaurantSettingsState = {
    success: false,
    message: "",
};

const inputClass =
    "w-full rounded-xl border border-hairline bg-surface-tint px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand-soft disabled:opacity-60";

const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

export default function SettingsForm({
    initial,
}: {
    initial: SettingsValues;
}) {
    const [state, formAction, isPending] = useActionState(
        updateRestaurantSettings,
        initialState
    );

    // The fields are controlled so a failed submission does not wipe them:
    // React resets uncontrolled inputs when a form action completes.
    const [values, setValues] = useState<SettingsValues>(initial);
    const lastHandledState = useRef(state);

    // On a failed submission, clear only the fields the server flagged as
    // invalid. Every other value stays filled in.
    useEffect(() => {
        if (lastHandledState.current === state) return;
        lastHandledState.current = state;
        if (!state.success && state.message && state.invalidFields?.length) {
            const invalid = new Set(state.invalidFields);
            setValues((prev) => {
                const next = { ...prev };
                (Object.keys(next) as (keyof SettingsValues)[]).forEach(
                    (key) => {
                        if (invalid.has(key)) next[key] = "";
                    }
                );
                return next;
            });
        }
    }, [state]);

    const updateField =
        (name: keyof SettingsValues) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setValues((prev) => ({ ...prev, [name]: value }));
        };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Settings
                </h1>
                <p className="mt-1 text-sm text-ink-soft">
                    Edit your restaurant&apos;s details. Changes show on your
                    guest menu straight away.
                </p>
            </div>

            {state.message ? (
                <div
                    className={
                        state.success
                            ? "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                            : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    }
                >
                    {state.message}
                </div>
            ) : null}

            <form
                action={formAction}
                className="space-y-5 rounded-card border border-hairline bg-surface p-6 shadow-soft"
            >
                <div>
                    <label htmlFor="settings-name" className={labelClass}>
                        Restaurant name
                    </label>
                    <input
                        id="settings-name"
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={updateField("name")}
                        placeholder="Your restaurant's name"
                        className={inputClass}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="settings-city"
                            className={labelClass}
                        >
                            City
                        </label>
                        <input
                            id="settings-city"
                            name="city"
                            type="text"
                            value={values.city}
                            onChange={updateField("city")}
                            placeholder="City"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="settings-phone"
                            className={labelClass}
                        >
                            Phone
                        </label>
                        <input
                            id="settings-phone"
                            name="phone"
                            type="tel"
                            value={values.phone}
                            onChange={updateField("phone")}
                            placeholder="Phone number"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="settings-address"
                        className={labelClass}
                    >
                        Address
                    </label>
                    <input
                        id="settings-address"
                        name="address"
                        type="text"
                        value={values.address}
                        onChange={updateField("address")}
                        placeholder="Street address"
                        className={inputClass}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="settings-opening"
                            className={labelClass}
                        >
                            Opening time
                        </label>
                        <input
                            id="settings-opening"
                            name="openingTime"
                            type="time"
                            value={values.openingTime}
                            onChange={updateField("openingTime")}
                            className={inputClass}
                        />
                        <p className="mt-1.5 text-xs text-ink-muted">
                            Leave blank if you don&apos;t want to show hours.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="settings-closing"
                            className={labelClass}
                        >
                            Closing time
                        </label>
                        <input
                            id="settings-closing"
                            name="closingTime"
                            type="time"
                            value={values.closingTime}
                            onChange={updateField("closingTime")}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="settings-autoclose"
                        className={labelClass}
                    >
                        Auto-close served orders after (minutes)
                    </label>
                    <input
                        id="settings-autoclose"
                        name="servedAutoCloseMinutes"
                        type="number"
                        min={5}
                        max={240}
                        step={1}
                        value={values.servedAutoCloseMinutes}
                        onChange={updateField("servedAutoCloseMinutes")}
                        className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-ink-muted">
                        A served order with no new items for this long closes
                        itself and frees the table. Leave blank for the
                        30-minute default.
                    </p>
                </div>

                <div className="flex justify-end border-t border-hairline pt-5">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Saving…" : "Save settings"}
                    </button>
                </div>
            </form>

            <p className="text-xs text-ink-muted">
                Your guest menu link and QR codes stay the same even if you
                change the restaurant name.
            </p>
        </div>
    );
}

"use client";

import { useState } from "react";
import { servicePackages } from "@/lib/service-packages";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function ServiceFeeEstimator() {
  const [areaInput, setAreaInput] = useState("");
  const area = Number(areaInput);
  const hasValidArea =
    areaInput.trim() !== "" && Number.isFinite(area) && area > 0;

  return (
    <section
      aria-labelledby="estimasi-biaya-title"
      className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.075),rgba(255,255,255,0.018)_48%,rgba(255,255,255,0.01))] p-5 sm:mt-14 sm:p-7 md:p-9"
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
            Perkiraan Awal
          </p>
          <h2
            id="estimasi-biaya-title"
            className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl"
          >
            Hitung Estimasi Biaya Jasa
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Masukkan luas area desain untuk melihat perkiraan biaya setiap
            paket berdasarkan tarif per meter persegi dan minimum biaya.
          </p>
          <label
            htmlFor="service-area"
            className="mt-5 block text-sm font-semibold text-white/82"
          >
            Luas area desain (m²)
          </label>
          <input
            id="service-area"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={areaInput}
            onChange={(event) => setAreaInput(event.target.value)}
            placeholder="Masukkan luas, mis. 60"
            aria-describedby="service-area-note"
            className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#080807]/75 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-[#D4AF37] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/45"
          />
          <p id="service-area-note" className="mt-2 text-xs leading-6 text-white/45">
            Gunakan angka luas dalam meter persegi. Biaya final mengikuti luas
            dan lingkup yang disepakati dalam penawaran.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {servicePackages.filter((item) => item.pricingModel !== "duration").map((item) => {
            const estimate = hasValidArea
              ? Math.max(area * item.rate, item.minimumFee)
              : null;

            return (
              <article
                key={item.id}
                className="min-w-0 rounded-2xl border border-white/10 bg-[#080807]/65 p-4 sm:p-5"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]/85">
                  {item.option}
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-6 text-white/88">
                  {item.title}
                </h3>
                {estimate !== null ? (
                  <>
                    <p className="mt-4 break-words font-display text-2xl leading-tight text-[#F4F1EA] sm:text-[1.7rem]">
                      {currencyFormatter.format(estimate)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/45">
                      Estimasi untuk {area.toLocaleString("id-ID")} m²
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-white/42">
                    Masukkan luas area untuk melihat estimasi.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-white/45">
        Estimasi ini hanya untuk jasa desain. Survei/pengukuran lapangan,
        pelaksanaan konstruksi, pembelian material, pengawasan, dan pekerjaan
        tambahan tidak otomatis termasuk dalam harga paket.
      </p>
    </section>
  );
}

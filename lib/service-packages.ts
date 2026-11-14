export type ServicePackageId = "opsi-1" | "opsi-2" | "opsi-3" | "opsi-4" | "render-animation";

export type ServicePackage = {
  id: ServicePackageId;
  option: string;
  title: string;
  label: string;
  rate: number;
  minimumFee: number;
  description: string;
  deliverables: string[];
  exclusions: string[];
  renderLimit: number | null;
  pricingModel?: "area" | "duration";
  priceLabel?: string;
};

export const servicePackages: ServicePackage[] = [
  {
    id: "opsi-1",
    option: "Opsi 1",
    title: "Konsep Desain Interior",
    label: "Arah konsep",
    rate: 25000,
    minimumFee: 1500000,
    description:
      "Untuk merapikan arah tata ruang, suasana, dan referensi visual sebelum masuk ke tahap visualisasi 3D.",
    deliverables: ["Gambar layout", "Moodboard"],
    exclusions: [
      "Tidak termasuk pemodelan 3D dan render.",
      "Tidak termasuk gambar kerja teknis.",
    ],
    renderLimit: null,
  },
  {
    id: "opsi-2",
    option: "Opsi 2",
    title: "3D Modeling & Render Interior",
    label: "Visualisasi 3D",
    rate: 50000,
    minimumFee: 3000000,
    description:
      "Untuk memvisualisasikan bentuk ruang, komposisi, dan suasana desain melalui model 3D serta gambar render.",
    deliverables: ["Pemodelan 3D", "Bonus 1 video Render Animation gratis (maksimal 60 detik)"],
    exclusions: ["Tidak termasuk gambar kerja."],
    renderLimit: 10,
  },
  {
    id: "opsi-3",
    option: "Opsi 3",
    title: "Desain Interior Lengkap",
    label: "Interior lengkap",
    rate: 100000,
    minimumFee: 6000000,
    description:
      "Untuk pengembangan desain interior dari layout hingga dokumentasi gambar kerja final sesuai lingkup yang disepakati.",
    deliverables: [
      "Gambar layout interior",
      "Pemodelan 3D",
      "Gambar kerja interior dalam format PDF",
      "Bonus 1 video Render Animation gratis (maksimal 60 detik)",
    ],
    exclusions: [
      "File sumber SketchUp (.skp) dan SketchUp LayOut (.layout) tidak termasuk paket standar.",
      "File AutoCAD (.dwg/.dxf) tidak disediakan.",
    ],
    renderLimit: 10,
  },
  {
    id: "opsi-4",
    option: "Opsi 4",
    title: "Desain Arsitektur Rumah Lengkap",
    label: "Arsitektur rumah",
    rate: 150000,
    minimumFee: 9000000,
    description:
      "Untuk perencanaan arsitektur rumah dari denah hingga dokumentasi gambar kerja sesuai lingkup proyek yang disepakati.",
    deliverables: [
      "Layout/denah arsitektur",
      "Pemodelan 3D",
      "Gambar kerja arsitektur dalam format PDF",
      "Bonus 1 video Render Animation gratis (maksimal 60 detik)",
    ],
    exclusions: [
      "File sumber SketchUp (.skp) dan SketchUp LayOut (.layout) tidak termasuk paket standar.",
      "File AutoCAD (.dwg/.dxf) tidak disediakan.",
    ],
    renderLimit: 10,
  },
  {
    id: "render-animation",
    option: "Layanan Tambahan",
    title: "Render Animation",
    label: "Animasi dari Gambar Render",
    rate: 0,
    minimumFee: 250000,
    description:
      "Mengubah gambar render interior maupun eksterior menjadi video animasi untuk presentasi desain, portofolio, atau promosi. Hasil render dapat dibuat oleh Eryawan Agung maupun dari klien.",
    deliverables: [
      "Video final MP4 Full HD",
      "Dua kali revisi ringan sesuai lingkup yang disepakati",
      "Dapat menggunakan render interior atau eksterior buatan Eryawan Agung maupun milik klien",
    ],
    exclusions: [
      "Harga berdasarkan durasi video final, bukan jumlah gambar render.",
      "Pembuatan model 3D dan pembuatan ulang gambar render tidak termasuk.",
      "Durasi di atas 60 detik memerlukan penawaran khusus.",
    ],
    renderLimit: null,
    pricingModel: "duration",
    priceLabel: "Mulai Rp250.000",
  },
];

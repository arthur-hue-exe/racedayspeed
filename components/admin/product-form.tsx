"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  saveProductAction,
  type ProductFormState,
} from "@/app/admin/(panel)/produtos/actions";
import type { AdminProduct } from "@/lib/admin-data";

type SizeRow = { label: string; stock: string };
type ImageRow = { id?: string; url: string; alt: string };

const DEFAULT_SIZES = ["PP", "P", "M", "G", "GG", "XGG"];

const initialState: ProductFormState = {};

const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-metal/50 focus:border-racing/60 focus:outline-none";
const labelClass =
  "mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-metal";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-racing" role="alert">
      {message}
    </p>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-metal">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function ProductForm({
  product,
  categories,
  saved,
}: {
  product?: AdminProduct;
  categories: { id: string; name: string }[];
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState);
  const [hasSizes, setHasSizes] = useState(Boolean(product?.hasSizes));
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes?.map((size) => ({
      label: size.label,
      stock: size.stock === null ? "" : String(size.stock),
    })) ?? [],
  );
  const [images, setImages] = useState<ImageRow[]>(
    product?.images?.map((image) => ({ id: image.id, url: image.url, alt: image.alt })) ?? [],
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const priceDefault =
    product?.priceCents !== null && product?.priceCents !== undefined
      ? (product.priceCents / 100).toFixed(2).replace(".", ",")
      : "";

  function toggleSizes(checked: boolean) {
    setHasSizes(checked);
    if (checked && sizes.length === 0) {
      setSizes(DEFAULT_SIZES.map((label) => ({ label, stock: "" })));
    }
  }

  function updateSize(index: number, field: keyof SizeRow, value: string) {
    setSizes((current) =>
      current.map((size, position) =>
        position === index ? { ...size, [field]: value } : size,
      ),
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError("");

    const selected = Array.from(files).slice(0, 10);
    if (images.length + selected.length > 12) {
      setUploadError("Cada produto pode ter no máximo 12 imagens.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      for (const file of selected) body.append("files", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { urls?: string[]; error?: string };
      if (data.urls?.length) {
        setImages((current) => [
          ...current,
          ...data.urls!.map((url) => ({ url, alt: "" })),
        ]);
      }
      if (!response.ok) {
        setUploadError(data.error ?? "Não foi possível enviar a imagem.");
      }
    } catch {
      setUploadError("Falha de conexão ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-metal transition hover:text-white"
          >
            <ArrowLeft size={13} aria-hidden />
            Voltar para produtos
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
            {product ? "Editar produto" : "Novo produto"}
          </h1>
          <p className="mt-1 text-sm text-metal">
            {product
              ? "Atualize preço, estoque, imagens e publicação."
              : "Cadastre um item do catálogo Race Day."}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-racing px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
          {pending ? "Salvando…" : "Salvar produto"}
        </button>
      </header>

      {saved && (
        <p className="rounded-xl border border-lime/25 bg-lime/8 px-4 py-3 text-sm text-lime">
          Produto salvo. As alterações já valem na loja.
        </p>
      )}

      {state.message && (
        <p role="alert" className="rounded-xl border border-racing/35 bg-racing/8 px-4 py-3 text-sm text-racing">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Section title="Informações principais">
            <div className="grid gap-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Nome do produto *
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={product?.name ?? ""}
                  required
                  className={inputClass}
                  placeholder="Ex.: Camiseta Team Suzuki"
                />
                <ErrorText message={state.errors?.name} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="slug" className={labelClass}>
                    Endereço (slug) *
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    defaultValue={product?.slug ?? ""}
                    required
                    className={inputClass}
                    placeholder="team-suzuki"
                  />
                  <p className="mt-1.5 text-[0.68rem] text-metal/70">
                    Usado em /produto/&lt;slug&gt;. Apenas letras minúsculas, números e hífens.
                  </p>
                  <ErrorText message={state.errors?.slug} />
                </div>
                <div>
                  <label htmlFor="sku" className={labelClass}>
                    SKU
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    defaultValue={product?.sku ?? ""}
                    className={inputClass}
                    placeholder="RD-001"
                  />
                  <ErrorText message={state.errors?.sku} />
                </div>
              </div>

              <div>
                <label htmlFor="shortDescription" className={labelClass}>
                  Descrição curta
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={product?.shortDescription ?? ""}
                  rows={2}
                  maxLength={240}
                  className={inputClass}
                  placeholder="Resumo exibido nos cards e na busca."
                />
                <ErrorText message={state.errors?.shortDescription} />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Descrição completa
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  rows={6}
                  maxLength={4000}
                  className={inputClass}
                  placeholder="Detalhes de tecido, modelagem, estampa, composição e observações."
                />
                <ErrorText message={state.errors?.description} />
              </div>
            </div>
          </Section>

          <Section
            title="Imagens e galeria"
            description="A primeira imagem aparece nos cards e na busca. Envie JPG, PNG, WEBP ou AVIF até 8 MB."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={`${image.id ?? "new"}-${image.url}`} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <div className="relative aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="size-full object-cover" />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-racing px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-ink">
                        Capa
                      </span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          aria-label="Mover imagem para a esquerda"
                          className="grid size-7 place-items-center rounded-full bg-ink/85 text-white disabled:opacity-30"
                        >
                          <ArrowLeft size={12} aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === images.length - 1}
                          aria-label="Mover imagem para a direita"
                          className="grid size-7 place-items-center rounded-full bg-ink/85 text-white disabled:opacity-30"
                        >
                          <ArrowRight size={12} aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((_, position) => position !== index))}
                        aria-label="Remover imagem"
                        className="grid size-7 place-items-center rounded-full bg-ink/85 text-racing hover:bg-racing hover:text-ink"
                      >
                        <Trash2 size={12} aria-hidden />
                      </button>
                    </div>
                  </div>
                  <input
                    value={image.alt}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((entry, position) =>
                          position === index ? { ...entry, alt: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="Texto alternativo"
                    aria-label={`Texto alternativo da imagem ${index + 1}`}
                    className="w-full border-t border-white/8 bg-black/40 px-2.5 py-2 text-[0.7rem] text-white placeholder:text-metal/50 focus:outline-none"
                  />
                </div>
              ))}

              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-center transition hover:border-racing/50 hover:bg-racing/5">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="sr-only"
                  onChange={(event) => void handleUpload(event.target.files)}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-racing" aria-hidden />
                ) : (
                  <UploadCloud size={20} className="text-metal" aria-hidden />
                )}
                <span className="px-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-metal">
                  {uploading ? "Enviando…" : "Enviar imagens"}
                </span>
              </label>
            </div>

            {images.length === 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs text-metal">
                <ImagePlus size={14} aria-hidden />
                Sem imagens cadastradas — o card exibirá &quot;Sem imagem&quot;.
              </p>
            )}

            {uploadError && (
              <p role="alert" className="mt-3 rounded-lg border border-racing/30 bg-racing/8 px-3 py-2 text-xs text-racing">
                {uploadError}
              </p>
            )}
            <ErrorText message={state.errors?.images} />
          </Section>

          <Section
            title="Tamanhos e estoque"
            description="Deixe o estoque vazio para exibir o tamanho como sob consulta. Use 0 para marcar como esgotado."
          >
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                name="hasSizes"
                checked={hasSizes}
                onChange={(event) => toggleSizes(event.target.checked)}
                className="size-4 accent-[#ffd500]"
              />
              <span>
                <span className="block text-sm font-medium text-white">Este produto tem tamanhos</span>
                <span className="block text-[0.68rem] text-metal">
                  Exibe o seletor de tamanho na página do produto e controla estoque por tamanho.
                </span>
              </span>
            </label>
            <ErrorText message={state.errors?.sizes} />

            {hasSizes ? (
              <div className="mt-4 space-y-2.5">
                {sizes.map((size, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                    <div>
                      <label className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-metal">
                        Tamanho
                      </label>
                      <input
                        value={size.label}
                        onChange={(event) => updateSize(index, "label", event.target.value.toUpperCase())}
                        maxLength={10}
                        aria-label={`Tamanho ${index + 1}`}
                        className={inputClass}
                        placeholder="G"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-metal">
                        Estoque (vazio = sob consulta)
                      </label>
                      <input
                        value={size.stock}
                        onChange={(event) => updateSize(index, "stock", event.target.value)}
                        inputMode="numeric"
                        aria-label={`Estoque do tamanho ${size.label || index + 1}`}
                        className={inputClass}
                        placeholder="—"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSizes((current) => current.filter((_, position) => position !== index))}
                      aria-label={`Remover tamanho ${size.label || index + 1}`}
                      className="mb-0.5 grid size-10 place-items-center rounded-xl border border-white/10 text-metal transition hover:border-racing/40 hover:text-racing"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSizes((current) => [...current, { label: "", stock: "" }])}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-metal transition hover:border-racing/40 hover:text-racing"
                >
                  <Plus size={13} aria-hidden />
                  Adicionar tamanho
                </button>
              </div>
            ) : (
              <div className="mt-4 max-w-xs">
                <label htmlFor="stock" className={labelClass}>
                  Estoque único
                </label>
                <input
                  id="stock"
                  name="stock"
                  defaultValue={product?.stock === null || product?.stock === undefined ? "" : String(product.stock)}
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="Vazio = sob consulta"
                />
                <p className="mt-1.5 text-[0.68rem] text-metal/70">
                  Vazio: disponibilidade sob consulta. 0: esgotado. Número: quantidade disponível.
                </p>
                <ErrorText message={state.errors?.stock} />
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Publicação">
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className={labelClass}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={product?.status ?? "draft"}
                  className={inputClass}
                >
                  <option value="active">Ativo (visível na loja)</option>
                  <option value="draft">Rascunho (oculto)</option>
                </select>
              </div>

              <div>
                <label htmlFor="categoryId" className={labelClass}>
                  Categoria
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                  className={inputClass}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ErrorText message={state.errors?.categoryId} />
              </div>

              <div>
                <label htmlFor="position" className={labelClass}>
                  Ordem no catálogo
                </label>
                <input
                  id="position"
                  name="position"
                  type="number"
                  min={0}
                  defaultValue={product?.position ?? ""}
                  className={inputClass}
                  placeholder="Automática"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-chalk/85">
                <input type="checkbox" name="isNew" defaultChecked={product?.isNew} className="size-4 accent-[#ffd500]" />
                Marcar como novidade
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-chalk/85">
                <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} className="size-4 accent-[#ffd500]" />
                Destacar na página inicial
              </label>
            </div>
          </Section>

          <Section title="Preço e compra">
            <div>
              <label htmlFor="price" className={labelClass}>
                Preço (R$)
              </label>
              <input
                id="price"
                name="price"
                defaultValue={priceDefault}
                inputMode="decimal"
                className={`${inputClass} font-display text-lg`}
                placeholder="Deixe vazio para sob consulta"
              />
              <p className="mt-1.5 text-[0.68rem] leading-relaxed text-metal/70">
                Sem preço, o produto não pode ser comprado pelo site: o cliente fala com a equipe pelo WhatsApp.
              </p>
              <ErrorText message={state.errors?.price} />
            </div>
          </Section>
        </aside>
      </div>

      <div className="flex justify-end border-t border-white/8 pt-5">
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-lime disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
          {pending ? "Salvando…" : "Salvar produto"}
        </button>
      </div>
    </form>
  );
}

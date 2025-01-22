import type { SVGComponent } from "./types"
import BxBug from "~icons/bx/bug"
import BxExport from "~icons/bx/export"
import BxImport from "~icons/bx/import"
import BxShareAlt from "~icons/bx/share-alt"
import BxTrash from "~icons/bx/trash"
import LucideChevronDown from "~icons/lucide/chevron-down"
import LucideChevronLeft from "~icons/lucide/chevron-left"
import LucideChevronRight from "~icons/lucide/chevron-right"
import LucideChevronUp from "~icons/lucide/chevron-up"

export const Chevron: Record<string, SVGComponent> = {
  Down: LucideChevronDown,
  Up: LucideChevronUp,
  Right: LucideChevronRight,
  Left: LucideChevronLeft,
}

export const Import: SVGComponent = BxImport

export const Export: SVGComponent = BxExport

export const Share: SVGComponent = BxShareAlt

export const Trash: SVGComponent = BxTrash

export const Bug: SVGComponent = BxBug

/** Shape of the user-facing text layer, kept separate from calculation logic. */
export interface DocumentSection {
  readonly title: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

export interface LegalDocument {
  readonly title: string
  readonly updated: string
  readonly intro: string
  readonly sections: readonly DocumentSection[]
}

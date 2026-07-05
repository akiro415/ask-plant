export interface AutocompleteOption {
  value: string;
  label: string;
  /** label 외 추가 검색어 (코드, 학명 등) */
  keywords?: string;
}

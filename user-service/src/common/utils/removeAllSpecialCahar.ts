export const normalizePhone = (input: string) => {
  return input.replace(/[^0-9+]/g, "")
}

export default function useFaceVerification() {
  async function enroll() { /* call face sdk */ return { success: true }; }
  async function verify() { return { success: true }; }
  return { enroll, verify };
}

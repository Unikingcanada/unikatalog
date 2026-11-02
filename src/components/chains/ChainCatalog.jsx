/**
 * ChainCatalog — entry point for the chain section from Home.
 * Since W58 the whole chain section comes from the Version X master in the Base44 entities
 * (see src/components/chainW58). The previous platform files are kept, unused, until sign-off.
 */
import ChainSection from "@/components/chainW58/ChainSection";

export default function ChainCatalog({ onBack, onGoRFQ }) {
  return <ChainSection onBack={onBack} onGoRFQ={onGoRFQ} />;
}

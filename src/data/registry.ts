import fs from 'fs'
import path from 'path'

export type RegistryItemSummary = {
  name: string;
  dependencies: string[];
  registryDependencies: string[];
}

// Reads the built shadcn registry item (public/r/<name>.json) so pages show what an install pulls in.
export function getRegistryItem (name: string): RegistryItemSummary | undefined {
  try {
    const file = path.join(process.cwd(), 'public', 'r', `${name}.json`)
    const item = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return {
      name,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
    }
  } catch {
    return undefined
  }
}

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('App.svelte'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if no NookAppHeader
  if (!content.includes('NookAppHeader')) continue;

  // 1. Ensure getPhoneContext is imported
  if (!content.includes('getPhoneContext')) {
    content = content.replace(
      /<script lang="ts">/,
      `<script lang="ts">\n  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';`
    );
  }

  // 2. Ensure const ctx = getPhoneContext() exists
  if (!content.includes('const ctx = getPhoneContext()') && !content.includes('const ctx=')) {
    content = content.replace(
      /(<script lang="ts">[\s\S]*?)(let |function |const |export )/,
      `$1const ctx = getPhoneContext();\n  $2`
    );
  }

  // 3. Ensure X is imported from lucide-svelte
  if (!content.includes(' X ') && !content.includes(', X }') && !content.includes('{ X }') && !content.includes(' X,')) {
    if (content.includes('@lucide/svelte')) {
      content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]@lucide\/svelte['"];/, (match, p1) => {
        return `import {${p1}, X } from '@lucide/svelte';`;
      });
    } else if (content.includes('lucide-svelte')) {
      content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-svelte['"];/, (match, p1) => {
        return `import {${p1}, X } from 'lucide-svelte';`;
      });
    } else {
      content = content.replace(
        /<script lang="ts">/,
        `<script lang="ts">\n  import { X } from '@lucide/svelte';`
      );
    }
  }

  // 4. Ensure NookAppHeader has an actions snippet with X button
  // Check if it already has the exact X button we want
  const closeBtnSnippet = `
    {#snippet actions()}
      <button
        onclick={ctx.handleHomeButton}
        class="nook-header-btn"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </button>
    {/snippet}`;

  if (!content.includes('title="Close App"') && !content.includes('<X class="w-3.5')) {
    if (content.includes('{#snippet actions()}')) {
      // Append inside the snippet
      content = content.replace(
        /({#snippet actions\(\)}[\s\S]*?){\/snippet}/,
        `$1  <button onclick={ctx.handleHomeButton} class="nook-header-btn" title="Close App"><X class="w-3.5 h-3.5 stroke-[3px]" /></button>\n    {/snippet}`
      );
    } else {
      // Find NookAppHeader and inject snippet
      // If it's self closing: <NookAppHeader title="Map" />
      if (/<NookAppHeader[^>]*\/>/.test(content)) {
        content = content.replace(
          /(<NookAppHeader[^>]*?)\s*\/>/,
          `$1>\n${closeBtnSnippet}\n  </NookAppHeader>`
        );
      } else {
        // Find closing tag </NookAppHeader>
        content = content.replace(
          /<\/NookAppHeader>/,
          `${closeBtnSnippet}\n  </NookAppHeader>`
        );
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}

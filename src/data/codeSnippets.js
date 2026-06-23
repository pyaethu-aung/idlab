// Code that produces each UUID version in popular languages, surfaced by the
// Generator's "Copy as code" panel for whatever version is selected in the
// rail. Pure data: a per-version list of { lang, code, full } rows.
//   - `lang` is the short mono label shown in the panel.
//   - `code` is the compact one-liner (import + call) shown in "inline" mode.
//   - `full` is the complete, copy-paste-runnable program shown in "full" mode.
// A trailing comment inside either form names the library or SQL dialect
// whenever the code is not standard-library, so a copied snippet is never
// silently misleading.
//
// Only the six generatable versions appear (v1/v3/v4/v5/v6/v7). The nil and max
// sentinels are fixed constants rather than generated values, so they have no
// entry and `snippetsFor` returns null for them (the panel then hides).
//
// Keep the language set and order consistent across versions so the panel rows
// line up: js, py, go, java, sql.

// Go and Java carry identical program scaffolding around a single call/import,
// so build those two full programs from helpers rather than repeating the
// boilerplate in every row (go uses tabs, matching gofmt).
const goProgram = (call) =>
  `package main\n\nimport (\n\t"fmt"\n\n\t"github.com/google/uuid"\n)\n\nfunc main() {\n\tfmt.Println(${call})\n}`;

const javaProgram = (importLine, call) =>
  `${importLine}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(${call});\n    }\n}`;

const CODE_SNIPPETS = {
  v4: [
    {
      lang: "js",
      code: "import { v4 as uuidv4 } from 'uuid'; uuidv4();",
      full: "import { v4 as uuidv4 } from 'uuid';\n\nconsole.log(uuidv4());",
    },
    {
      lang: "py",
      code: "import uuid; uuid.uuid4()",
      full: "import uuid\n\nprint(uuid.uuid4())",
    },
    {
      lang: "go",
      code: "uuid.New()  // github.com/google/uuid",
      full: goProgram("uuid.New()"),
    },
    {
      lang: "java",
      code: "java.util.UUID.randomUUID();",
      full: javaProgram(
        "import java.util.UUID;",
        "UUID.randomUUID()",
      ),
    },
    {
      lang: "sql",
      code: "SELECT gen_random_uuid();  -- PostgreSQL 13+",
      full: "-- PostgreSQL 13+\nSELECT gen_random_uuid();",
    },
  ],
  v1: [
    {
      lang: "js",
      code: "import { v1 as uuidv1 } from 'uuid'; uuidv1();",
      full: "import { v1 as uuidv1 } from 'uuid';\n\nconsole.log(uuidv1());",
    },
    {
      lang: "py",
      code: "import uuid; uuid.uuid1()",
      full: "import uuid\n\nprint(uuid.uuid1())",
    },
    {
      lang: "go",
      code: "uuid.NewUUID()  // github.com/google/uuid (v1)",
      full: goProgram("uuid.Must(uuid.NewUUID())"),
    },
    {
      lang: "java",
      code: "Generators.timeBasedGenerator().generate();  // com.fasterxml.uuid",
      full: javaProgram(
        "import com.fasterxml.uuid.Generators;  // com.fasterxml.uuid:java-uuid-generator",
        "Generators.timeBasedGenerator().generate()",
      ),
    },
    {
      lang: "sql",
      code: "SELECT uuid_generate_v1();  -- uuid-ossp extension",
      full: '-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nSELECT uuid_generate_v1();',
    },
  ],
  v6: [
    {
      lang: "js",
      code: "import { v6 as uuidv6 } from 'uuid'; uuidv6();",
      full: "import { v6 as uuidv6 } from 'uuid';\n\nconsole.log(uuidv6());",
    },
    {
      lang: "py",
      code: "from uuid6 import uuid6; uuid6()  # pip install uuid6",
      full: "# pip install uuid6\nfrom uuid6 import uuid6\n\nprint(uuid6())",
    },
    {
      lang: "go",
      code: "uuid.NewV6()  // github.com/google/uuid",
      full: goProgram("uuid.Must(uuid.NewV6())"),
    },
    {
      lang: "java",
      code: "Generators.timeBasedReorderedGenerator().generate();  // com.fasterxml.uuid",
      full: javaProgram(
        "import com.fasterxml.uuid.Generators;  // com.fasterxml.uuid:java-uuid-generator",
        "Generators.timeBasedReorderedGenerator().generate()",
      ),
    },
  ],
  v7: [
    {
      lang: "js",
      code: "import { v7 as uuidv7 } from 'uuid'; uuidv7();",
      full: "import { v7 as uuidv7 } from 'uuid';\n\nconsole.log(uuidv7());",
    },
    {
      lang: "py",
      code: "from uuid6 import uuid7; uuid7()  # pip install uuid6",
      full: "# pip install uuid6\nfrom uuid6 import uuid7\n\nprint(uuid7())",
    },
    {
      lang: "go",
      code: "uuid.NewV7()  // github.com/google/uuid",
      full: goProgram("uuid.Must(uuid.NewV7())"),
    },
    {
      lang: "java",
      code: "Generators.timeBasedEpochGenerator().generate();  // com.fasterxml.uuid",
      full: javaProgram(
        "import com.fasterxml.uuid.Generators;  // com.fasterxml.uuid:java-uuid-generator",
        "Generators.timeBasedEpochGenerator().generate()",
      ),
    },
    {
      lang: "sql",
      code: "SELECT uuidv7();  -- PostgreSQL 18+",
      full: "-- PostgreSQL 18+\nSELECT uuidv7();",
    },
  ],
  v3: [
    {
      lang: "js",
      code: "import { v3 as uuidv3 } from 'uuid'; uuidv3('name', uuidv3.DNS);",
      full: "import { v3 as uuidv3 } from 'uuid';\n\nconsole.log(uuidv3('name', uuidv3.DNS));",
    },
    {
      lang: "py",
      code: "import uuid; uuid.uuid3(uuid.NAMESPACE_DNS, 'name')",
      full: "import uuid\n\nprint(uuid.uuid3(uuid.NAMESPACE_DNS, 'name'))",
    },
    {
      lang: "go",
      code: 'uuid.NewMD5(uuid.NameSpaceDNS, []byte("name"))  // google/uuid',
      full: goProgram('uuid.NewMD5(uuid.NameSpaceDNS, []byte("name"))'),
    },
    {
      lang: "java",
      code: 'java.util.UUID.nameUUIDFromBytes("name".getBytes());  // MD5 / v3',
      full: javaProgram(
        "import java.util.UUID;  // MD5 / v3",
        'UUID.nameUUIDFromBytes("name".getBytes())',
      ),
    },
    {
      lang: "sql",
      code: "SELECT uuid_generate_v3(uuid_ns_dns(), 'name');  -- uuid-ossp",
      full: '-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nSELECT uuid_generate_v3(uuid_ns_dns(), \'name\');',
    },
  ],
  v5: [
    {
      lang: "js",
      code: "import { v5 as uuidv5 } from 'uuid'; uuidv5('name', uuidv5.DNS);",
      full: "import { v5 as uuidv5 } from 'uuid';\n\nconsole.log(uuidv5('name', uuidv5.DNS));",
    },
    {
      lang: "py",
      code: "import uuid; uuid.uuid5(uuid.NAMESPACE_DNS, 'name')",
      full: "import uuid\n\nprint(uuid.uuid5(uuid.NAMESPACE_DNS, 'name'))",
    },
    {
      lang: "go",
      code: 'uuid.NewSHA1(uuid.NameSpaceDNS, []byte("name"))  // google/uuid',
      full: goProgram('uuid.NewSHA1(uuid.NameSpaceDNS, []byte("name"))'),
    },
    {
      lang: "java",
      code: 'Generators.nameBasedGenerator().generate("name");  // com.fasterxml.uuid (v5)',
      full: javaProgram(
        "import com.fasterxml.uuid.Generators;  // com.fasterxml.uuid:java-uuid-generator",
        'Generators.nameBasedGenerator().generate("name")',
      ),
    },
    {
      lang: "sql",
      code: "SELECT uuid_generate_v5(uuid_ns_dns(), 'name');  -- uuid-ossp",
      full: '-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\nSELECT uuid_generate_v5(uuid_ns_dns(), \'name\');',
    },
  ],
};

// The Generator's single entry point: the rows for a version, or null for any
// id without snippets (the nil/max sentinels, or an unknown version).
export function snippetsFor(version) {
  return CODE_SNIPPETS[version] ?? null;
}

export default CODE_SNIPPETS;

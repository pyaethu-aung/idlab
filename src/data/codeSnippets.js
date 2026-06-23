// One-liners that produce each UUID version in popular languages, surfaced by
// the Generator's "Copy as code" panel for whatever version is selected in the
// rail. Pure data: a per-version list of { lang, code } rows. `lang` is the
// short mono label shown in the panel; a trailing comment inside `code` names
// the library or SQL dialect whenever the line is not standard-library, so a
// copied snippet is never silently misleading.
//
// Only the six generatable versions appear (v1/v3/v4/v5/v6/v7). The nil and max
// sentinels are fixed constants rather than generated values, so they have no
// entry and `snippetsFor` returns null for them (the panel then hides).
//
// Keep the language set and order consistent across versions so the panel rows
// line up: js, py, go, java, sql.
const CODE_SNIPPETS = {
  v4: [
    { lang: "js", code: "import { v4 as uuidv4 } from 'uuid'; uuidv4();" },
    { lang: "py", code: "import uuid; uuid.uuid4()" },
    { lang: "go", code: "uuid.New()  // github.com/google/uuid" },
    { lang: "java", code: "java.util.UUID.randomUUID();" },
    { lang: "sql", code: "SELECT gen_random_uuid();  -- PostgreSQL 13+" },
  ],
  v1: [
    { lang: "js", code: "import { v1 as uuidv1 } from 'uuid'; uuidv1();" },
    { lang: "py", code: "import uuid; uuid.uuid1()" },
    { lang: "go", code: "uuid.NewUUID()  // github.com/google/uuid (v1)" },
    { lang: "java", code: "Generators.timeBasedGenerator().generate();  // com.fasterxml.uuid" },
    { lang: "sql", code: "SELECT uuid_generate_v1();  -- uuid-ossp extension" },
  ],
  v6: [
    { lang: "js", code: "import { v6 as uuidv6 } from 'uuid'; uuidv6();" },
    { lang: "py", code: "from uuid6 import uuid6; uuid6()  # pip install uuid6" },
    { lang: "go", code: "uuid.NewV6()  // github.com/google/uuid" },
    { lang: "java", code: "Generators.timeBasedReorderedGenerator().generate();  // com.fasterxml.uuid" },
  ],
  v7: [
    { lang: "js", code: "import { v7 as uuidv7 } from 'uuid'; uuidv7();" },
    { lang: "py", code: "from uuid6 import uuid7; uuid7()  # pip install uuid6" },
    { lang: "go", code: "uuid.NewV7()  // github.com/google/uuid" },
    { lang: "java", code: "Generators.timeBasedEpochGenerator().generate();  // com.fasterxml.uuid" },
    { lang: "sql", code: "SELECT uuidv7();  -- PostgreSQL 18+" },
  ],
  v3: [
    { lang: "js", code: "import { v3 as uuidv3 } from 'uuid'; uuidv3('name', uuidv3.DNS);" },
    { lang: "py", code: "import uuid; uuid.uuid3(uuid.NAMESPACE_DNS, 'name')" },
    { lang: "go", code: 'uuid.NewMD5(uuid.NameSpaceDNS, []byte("name"))  // google/uuid' },
    { lang: "java", code: 'java.util.UUID.nameUUIDFromBytes("name".getBytes());  // MD5 / v3' },
    { lang: "sql", code: "SELECT uuid_generate_v3(uuid_ns_dns(), 'name');  -- uuid-ossp" },
  ],
  v5: [
    { lang: "js", code: "import { v5 as uuidv5 } from 'uuid'; uuidv5('name', uuidv5.DNS);" },
    { lang: "py", code: "import uuid; uuid.uuid5(uuid.NAMESPACE_DNS, 'name')" },
    { lang: "go", code: 'uuid.NewSHA1(uuid.NameSpaceDNS, []byte("name"))  // google/uuid' },
    { lang: "java", code: 'Generators.nameBasedGenerator().generate("name");  // com.fasterxml.uuid (v5)' },
    { lang: "sql", code: "SELECT uuid_generate_v5(uuid_ns_dns(), 'name');  -- uuid-ossp" },
  ],
};

// The Generator's single entry point: the rows for a version, or null for any
// id without snippets (the nil/max sentinels, or an unknown version).
export function snippetsFor(version) {
  return CODE_SNIPPETS[version] ?? null;
}

export default CODE_SNIPPETS;

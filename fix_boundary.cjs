const fs = require('fs');
let code = fs.readFileSync('src/components/SMKRekapPreview.jsx', 'utf8');

code = code.replace("</difunction NeedApprovalView", "      </div>\n    </div>\n  );\n}\n\nfunction NeedApprovalView");

code = code.replace("}      </div>\n        ))\n      )}\n    </div>\n  );\n}\n\nexport default function SMKRekap(){", "}\n\nexport default function SMKRekap(){");

fs.writeFileSync('src/components/SMKRekapPreview.jsx', code);

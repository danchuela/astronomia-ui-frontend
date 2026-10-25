# Saved studies

The demo email is not authentication. Studies are stored in IndexedDB on this
browser, not indexed publicly by an email address or synchronized to the VPS.
Anyone with access to the same browser profile and origin can access its studies.
Clearing site data removes these copies; PDF/CSV exports are external backups of
the report and tabular results, not importable full-study archives.

The save action is explicit and available on newly completed image analyses with
structured results. Older conversation entries without numerical payloads are
not reconstructed from chatbot prose. A saved study retains the complete result
JSON, original request, quality/provenance, and bounded copies of all referenced
analysis images. If any referenced image cannot be copied, saving fails rather
than claiming that an incomplete study is available offline.

When the corresponding uploaded input is still in memory, its bytes are checked
against the result SHA-256 and saved with its HDU/source/region/error settings.
Saving an old result after reloading can omit that input; the interface and PDF
explicitly identify that the original is not included. A display preview is never
labelled or downloaded as the original FITS. Raw files never enter localStorage.

Limits: 50 studies, 32 MiB each and 128 MiB total, enforced in the same read/write
transaction as the update. Browser/device quotas may be lower and are reported as
failed operations, not successful saves. Rename and delete affect only local
studies, not server artifacts or chat messages. IndexedDB data survives reloads,
but offline access to the whole web application is not promised (no service worker).

CSV is UTF-8/BOM, quoted comma-separated data with CRLF line endings. It preserves
native numerical precision, nulls versus zero, nested table indexes, quality,
parameters, software versions and provenance. Formula-like strings are escaped;
negative numbers remain numeric. No unit conversion or calibration is inferred.
PDF embeds a locally served DejaVu font and cached images; it does not send data
to a conversion service or invoke an LLM. Numeric values in the PDF are formatted
for reading; long numeric arrays are represented by their plots rather than
dumped line by line. CSV retains complete tables and full precision. PDF is
text/images, not executable HTML.

Comparisons display two independent result sets, without automatic alignment,
PSF matching, resampling or physical interpretation of differences. Unsupported
or unavailable measurements are not replaced with zero.

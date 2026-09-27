import os
import re

workspace = r"D:\rohan\parth\website skyislimit"

for fname in os.listdir(workspace):
    if fname.endswith(".html"):
        fpath = os.path.join(workspace, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace root-relative links with relative links
        content = re.sub(r'href="/(about|packages|flights|hotels|visa|forex|contact|payment-policy|refund-policy)\.php"', r'href="\1.html"', content)
        content = re.sub(r'href="/(about|packages|flights|hotels|visa|forex|contact|payment-policy|refund-policy)\.html"', r'href="\1.html"', content)
        content = re.sub(r'href="/package-details\.php\?id=(\d+)"', r'href="package-details_id_\1.html"', content)
        content = re.sub(r'href="/"', r'href="index.html"', content)
        content = re.sub(r'src="/assets/', r'src="assets/', content)
        content = re.sub(r'href="/assets/', r'href="assets/', content)
        content = re.sub(r"url\('/assets/", r"url('assets/", content)
        content = re.sub(r'url\("/assets/', r'url("assets/', content)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

print("All HTML pages normalized!")

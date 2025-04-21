import argparse
import pathlib
import re
import sys
import yaml


def extract_front_matter(file):
    """Extract front matter as yaml"""
    content = file.read_text()

    front_matter_start = content.find("---", 0)
    if front_matter_start == -1:
        raise RuntimeError(f"'{file}': front matter start not found")

    front_matter_end = content.find("---", front_matter_start + 3)
    if front_matter_end == -1:
        raise RuntimeError(f"'{file}': front matter end not found")

    front_matter = content[front_matter_start + 3 : front_matter_end].strip()
    try:
        return yaml.safe_load(front_matter)
    except Exception as e:
        raise RuntimeError(f"'{file}': failed to parse front matter as yaml")


def is_draft(file):
    """Is the file a draft according to front matter?"""
    front_matter = extract_front_matter(file)
    draft_flag = front_matter.get("draft", False)
    if not isinstance(draft_flag, bool):
        raise RuntimeError(f"'{file}': draft value in front matter is not bool")
    return draft_flag


def partition(items, condition):
    """Partition an 'items' list into 2 lists based on 'condition':
    - where condition is true,
    - and where is false"""
    part1 = []
    part2 = []
    for p in items:
        if condition(p):
            part1.append(p)
        else:
            part2.append(p)
    return part1, part2


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("posts_folder")
    args = parser.parse_args()

    root = pathlib.Path(args.posts_folder)
    if not root.is_dir():
        raise RuntimeError(f"'{args.posts_folder}' is not a valid directory")

    subdirs = [p for p in root.iterdir() if p.is_dir()]

    page_bundles = [p for p in subdirs if (p / "index.md").exists()]

    other_dirs = [p for p in subdirs if p not in page_bundles]
    if other_dirs:
        raise RuntimeError(
            f"Subdirectories (except for page bundles) are not allowed in '{root}', but found: '{other_dirs}'"
        )

    # MAIN regex pattern:
    #   YYYY-MM-DD-title_with-sub-titles
    #
    # Post files must have '.md' extension.
    # Page bundle directory must match the pattern and contain 'index.md' file.
    #
    # Paths following the pattern must NOT be Draft.
    # Paths NOT following the pattern must be Draft.
    MAIN_REGEX = r"202[45]-[0-9]{2}-[0-9]{2}[-_][a-z0-9]+([-_][a-z0-9]+)+"

    # page bundles
    bundle_dir_regex = re.compile(MAIN_REGEX)
    expected_bundles, expected_bundle_drafts = partition(
        page_bundles, lambda p: bundle_dir_regex.fullmatch(p.name)
    )

    not_posts = [d.name for d in expected_bundles if is_draft(d / "index.md")]
    not_drafts = [
        d.name for d in expected_bundle_drafts if not is_draft(d / "index.md")
    ]

    # page files
    md_files = [p for p in root.iterdir() if str(p).endswith(".md")]

    post_filename_regex = re.compile(MAIN_REGEX + "\.md")
    expected_posts, expected_drafts = partition(
        md_files, lambda p: post_filename_regex.fullmatch(p.name)
    )

    not_posts.extend([f.name for f in expected_posts if is_draft(f)])
    not_drafts.extend([f.name for f in expected_drafts if not is_draft(f)])

    # conclusion
    if not_posts or not_drafts:
        msg_lines = []
        if not_posts:
            msg_lines.append(f"Posts '{not_posts}' are marked as draft in front matter")
        if not_drafts:
            msg_lines.append(
                f"Drafts '{not_drafts}' are not marked as draft in front matter"
            )

        raise RuntimeError("\n".join(msg_lines))

    print("OK")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        print(f"Error: {e}")
        sys.exit(1)

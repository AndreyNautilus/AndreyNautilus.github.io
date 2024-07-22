import argparse
import pathlib
import re
import sys
import yaml


def extract_front_matter(file):
    '''Extract front matter as yaml'''
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
    '''Is the file a draft according to front matter?'''
    front_matter = extract_front_matter(file)
    draft_flag = front_matter.get("draft", False)
    if not isinstance(draft_flag, bool):
        raise RuntimeError(f"'{file}': draft value in front matter is not bool")
    return draft_flag


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("posts_folder")
    args = parser.parse_args()

    root = pathlib.Path(args.posts_folder)
    if not root.is_dir():
        raise RuntimeError(f"'{args.posts_folder}' is not a valid directory")

    subdirs = [p for p in root.iterdir() if p.is_dir()]
    if subdirs:
        raise RuntimeError(f"Subdirectories are not allowed in '{root}', but found: '{subdirs}'")

    md_files = [p for p in root.iterdir() if str(p).endswith(".md")]

    # filenames pattern:
    #   YYYY-MM-DD-title_with-sub-titles.md
    #
    # files following the pattern must NOT be Draft.
    # files NOT following the pattern must be Draft.
    post_filename_regex = re.compile(r"2024-[0-9]{2}-[0-9]{2}[-_]([a-z0-9]+[-_]?)+.md")
    expected_posts = []
    expected_drafts = []
    for f in md_files:
        if post_filename_regex.fullmatch(f.name):
            expected_posts.append(f)
        else:
            expected_drafts.append(f)

    not_posts = [f.name for f in expected_posts if is_draft(f)]
    not_drafts = [f.name for f in expected_drafts if not is_draft(f)]
    if not_posts or not_drafts:
        msg_lines = []
        if not_posts:
            msg_lines.append(f"Posts '{not_posts}' are marked as draft in front matter")
        if not_drafts:
            msg_lines.append(f"Drafts '{not_drafts}' are not marked as draft in front matter")

        raise RuntimeError('\n'.join(msg_lines))

    print("OK")


if __name__ == '__main__':
    try:
        main()
    except RuntimeError as e:
        print(f"Error: {e}")
        sys.exit(1)

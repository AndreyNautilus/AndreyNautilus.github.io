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

    # allowed filenames:
    #   1-ab_cd.md
    #   042-title_with-subtitle.md
    allowed_filename_regex = re.compile(r"[0-9]+-([a-z0-9]+[-_])+[a-z0-9]+\.md")
    invalid_files = [f for f in md_files if not allowed_filename_regex.fullmatch(f.name)]
    if invalid_files:
        raise RuntimeError(f"Filenames don't match allowed regex: '{invalid_files}'")

    # drafts start with '0-', '00-', '000-' etc.
    draft_filename_regex = re.compile(r"0+-.*")
    drafts = [f for f in md_files if draft_filename_regex.fullmatch(f.name)]
    not_drafts = [f for f in drafts if not is_draft(f)]
    if not_drafts:
        raise RuntimeError(f"Drafts '{not_drafts}' are not marked as draft in front matter")

    posts = [f for f in md_files if f not in drafts]
    not_posts = [f for f in posts if is_draft(f)]
    if not_posts:
        raise RuntimeError(f"Posts '{not_posts}' are marked as draft")

    # TODO:
    # - verify size of number prefix

    print("OK")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

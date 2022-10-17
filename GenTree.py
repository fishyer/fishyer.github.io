from pathlib import Path
import os
tree_str = ''
 
def generate_tree(pathname, n=0):
    global tree_str
    name=pathname.name
    if pathname.is_file():
        # 过滤文件
        if  name.startswith('_') or name.startswith('.') or name.endswith(".json") or name.endswith(".js") or name.endswith(".py") or name.endswith(".html") or name.endswith(".html"):
            pass
        else:
            # 打印文件
            fileName=os.path.splitext(pathname.name)[0]
            relativePath=str(pathname.relative_to(Path(exeDir)))
            tree_str +=f"{'  ' * (n)}- [{fileName}]({relativePath})\n"
    elif pathname.is_dir():
        # 不处理config文件夹
        if name.startswith("config") or name.startswith(".") or name.startswith("config"):
            pass
        else:
            # 不显示MyDocsify文件夹名字，但是显示子文件夹
            if  name.startswith("MyDocsify"):
                pass
            else:
                tree_str += '  ' * (n) + '- ' + str(pathname.relative_to(pathname.parent)) +'\n'
            for cp in pathname.iterdir():
                # 递归文件夹
                generate_tree(cp, n + 1)
 
# 写入文本到文件
def writeStr(val, path):  # 写入文本到文件
    if os.path.exists(path):
        os.remove(path)
    with open(path, 'w', encoding='utf-8') as file:
        file.write(val)
        print(f"写入文本到文件成功：",path)

curDir=os.getcwd()
print("curDir:",curDir)
exeDir=os.path.dirname(os.path.abspath(__file__))
print("exeDir:",exeDir)
mdPath=os.path.join(exeDir,"_sidebar.md")
print("mdPath:",exeDir)

if __name__ == '__main__':
    # generate_tree(Path.cwd())
    generate_tree(Path(exeDir))
    # - [效能工具](/效能工具/从用开始，反思不止.md)
    #     |    |----我的基金投资策略.md
    
    writeStr(tree_str,mdPath)

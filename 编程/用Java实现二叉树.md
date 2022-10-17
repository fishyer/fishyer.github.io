tags: 算法

#1.构建二叉树
首先，创建一个节点类
```
    /**
     * 节点类
     */
    public class TreeNode<T> {
        private int index;
        private T data;
        private TreeNode<T> leftChild;
        private TreeNode<T> rightChild;

        public TreeNode(int index, T data) {
            this.index = index;
            this.data = data;
        }

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }

        public T getData() {
            return data;
        }

        public void setData(T data) {
            this.data = data;
        }

        public TreeNode<T> getLeftChild() {
            return leftChild;
        }

        public void setLeftChild(TreeNode<T> leftChild) {
            this.leftChild = leftChild;
        }

        public TreeNode<T> getRightChild() {
            return rightChild;
        }

        public void setRightChild(TreeNode<T> rightChild) {
            this.rightChild = rightChild;
        }
    }
```
然后，创建根节点，构建节点之间的关系
```
    private TreeNode<String> root;//根节点

    public BinaryTree() {
        root = new TreeNode<>(1, "A");
    }


    /**
     * 构建二叉树
     *     A
     *  B     C
     * D E     F
     */
    private void buildBinaryTree() {
        TreeNode<String> nodeB = new TreeNode<>(2, "B");
        TreeNode<String> nodeC = new TreeNode<>(3, "C");
        TreeNode<String> nodeD = new TreeNode<>(4, "D");
        TreeNode<String> nodeE = new TreeNode<>(5, "E");
        TreeNode<String> nodeF = new TreeNode<>(6, "F");
        root.leftChild = nodeB;
        root.rightChild = nodeC;
        nodeB.leftChild = nodeD;
        nodeB.rightChild = nodeE;
        nodeC.rightChild = nodeF;
    }
```

#2.获取二叉树的高度和节点数量
```
    /**
     * 获取二叉树的高度
     *
     * @return
     */
    private int getHeight() {
        return getHeight(root);
    }

    private <T> int getHeight(TreeNode<T> node) {
        if (node == null) {
            return 0;
        } else {
            int i = getHeight(node.leftChild);
            int j = getHeight(node.rightChild);
            return (i > j) ? i + 1 : j + 1;
        }
    }
    
        /**
     * 获取二叉树的节点数量
     *
     * @return
     */
    private int getSize() {
        return getSize(root);
    }

    private <T> int getSize(TreeNode<T> node) {
        if (node == null) {
            return 0;
        } else {
            return 1 + getSize(node.leftChild) + getSize(node.rightChild);
        }
    }
```
#3.迭代方式遍历二叉树
```
    /**
     * 前序遍历-迭代
     *
     * @param node
     * @param <T>
     */
    private <T> void preOrder(TreeNode<T> node) {
        if (node == null) {
            return;
        } else {
            System.out.println("preOrder:" + node.getData());
            preOrder(node.leftChild);
            preOrder(node.rightChild);
        }
    }

    /**
     * 中序遍历-迭代
     *
     * @param node
     * @param <T>
     */
    private <T> void midOrder(TreeNode<T> node) {
        if (node == null) {
            return;
        } else {
            midOrder(node.leftChild);
            System.out.println("midOrder:" + node.getData());
            midOrder(node.rightChild);
        }
    }

    /**
     * 后序遍历-迭代
     *
     * @param node
     * @param <T>
     */
    private <T> void postOrder(TreeNode<T> node) {
        if (node == null) {
            return;
        } else {
            postOrder(node.leftChild);
            postOrder(node.rightChild);
            System.out.println("postOrder:" + node.getData());
        }
    }
```
#4.非迭代方式遍历二叉树
```
    /**
     * 前序遍历-非迭代
     *
     * @param node
     * @param <T>
     */
    private <T> void preStackOrder(TreeNode<T> node) {
        if (node == null) {
            return;
        } else {
            Stack<TreeNode> stack = new Stack<>();
            stack.push(node);
            while (!stack.isEmpty()) {
                //弹出根节点
                TreeNode root = stack.pop();
                System.out.println("preStackOrder:" + root.getData());
                //压入子节点
                if (root.rightChild != null) {
                    stack.push(root.rightChild);
                }
                if (root.leftChild != null) {
                    stack.push(root.leftChild);
                }

            }
        }
    }
```
#5.测试场景
```
    /**
     * 测试场景
     *
     * @param args
     */
    public static void main(String[] args) {
        BinaryTree binaryTree = new BinaryTree();
        binaryTree.buildBinaryTree();
        int height = binaryTree.getHeight();
        System.out.println("height：" + height);//高度:3
        int size = binaryTree.getSize();
        System.out.println("size：" + size);//节点数量:6
        binaryTree.preOrder(binaryTree.root);//前序遍历:ABDECF
        binaryTree.midOrder(binaryTree.root);//中序遍历:DBEACF
        binaryTree.postOrder(binaryTree.root);//后序遍历:DEBFCA
        binaryTree.preStackOrder(binaryTree.root);//前序遍历(非迭代):ABDECF
    }
```
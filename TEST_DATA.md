# 手工测试集

本文件提供一组可直接照着建卡的测试数据，字段与 [README.md](README.md) 保持一致：

- `id`
- `type`
- `question`
- `options`
- `answer`
- `notes`
- `extra`
- `audio`

建议先建立一个专用测试笔记类型，再新建以下测试卡。每张卡建完以后，按“测试目标”和“预期结果”执行。

## 使用建议

1. 先录入 `基础功能组`，确认主流程能跑。
2. 再录入 `复杂内容组`，验证公式、图片、长解析。
3. 最后录入 `边界与回归组`，抓异常和串状态问题。
4. 同一批测试卡至少在桌面 Anki、AnkiDroid、AnkiMobile 各跑一轮主路径。

## 基础功能组

### C01 单选基础

**字段**

```text
id: C01
type: choice
question: 中国的首都是哪座城市？
options: 北京||上海||广州||深圳
answer: 1
notes: 北京是中国首都。此卡用于验证单选、自动翻面、答案回填、解析显示。
extra:
audio:
```

**测试目标**

- 单选高亮
- 自动翻面
- 背面答案摘要
- 解析显示

**预期结果**

- 正面点任一选项后仅该项高亮。
- 若开启自动翻面，应立即翻到背面。
- 背面应标出正确项与误选项。
- 背面应显示解析。

### C02 多选基础

**字段**

```text
id: C02
type: choice
question: 下列哪些属于编程语言？
options: Python||Banana||Rust||Notebook||Go
answer: 1||3||5
notes: Python、Rust、Go 都是编程语言。本卡用于测试多选、统计、漏选、误选。
extra:
audio:
```

**测试目标**

- 多选状态切换
- 自动翻面触发条件
- 背面统计
- 漏选和误选样式

**预期结果**

- 点满 3 项之前不翻面。
- 点中已选项会取消。
- 背面应同时能显示“答对 / 误选 / 正确但未选”。

### Q01 问答基础

**字段**

```text
id: Q01
type: qa
question: 简述 TCP 三次握手的目的。
options:
answer: 建立可靠连接并确认双方的发送与接收能力。
notes: 三次握手的核心是同步双方的初始序列号，并确认收发链路可用。本卡用于测试问答题正反面展示与解析编辑。
extra:
audio:
```

**测试目标**

- 问答题渲染
- 正面显示解析
- 正面解析编辑
- 背面读取同一份解析

**预期结果**

- 正面不显示选择项。
- 开启“正面显示解析”后，解析区出现在正面。
- 修改正面解析后，背面显示相同内容。

### F01 单空填空

**字段**

```text
id: F01
type: fill
question: HTTP 默认端口是 {{c1::80::请输入端口号}}。
options:
answer: 80
notes: 用于测试单空输入、Enter 提交、背面回显。
extra:
audio:
```

**测试目标**

- 三种输入样式
- 输入保存
- Enter 提交
- 背面答案回显

**预期结果**

- 横线、方框、遮挡三种模式都能渲染输入控件。
- 输入后翻面，背面显示你的作答和正确答案。

### F02 多空填空

**字段**

```text
id: F02
type: fill
question: React 中用于状态管理的基础 Hook 是 {{c1::useState::Hook 名称}}，用于副作用处理的是 {{c2::useEffect::Hook 名称}}，用于引用 DOM 或可变值的是 {{c3::useRef::Hook 名称}}。
options:
answer: useState||useEffect||useRef
notes: 用于测试多空输入、长文本、状态持久化和逐项回显。
extra:
audio:
```

**测试目标**

- 多空输入
- 切卡再返回后的草稿保留
- 背面逐项判定

**预期结果**

- 三个空都可独立输入。
- 切走再回来，输入内容仍在。
- 背面每个空都有用户答案和正确答案。

### O01 图片遮挡基础

**字段**

```text
id: O01
type: occlusion
question: 请指出图中的两个重点区域。
options:
answer:
notes: 用于测试图片遮挡的点击显隐、显示下一个挖空、切换全部遮挡。
extra: {"image":"images/red.png","masks":[{"id":"1","x":10,"y":10,"w":25,"h":30,"label":"区域1"},{"id":"2","x":55,"y":45,"w":25,"h":30,"label":"区域2"}]}
audio:
```

**测试目标**

- 单个遮挡切换
- 显示下一个挖空
- 切换全部遮挡

**预期结果**

- 两个遮挡块都显示在图上。
- 点击单个遮挡块只影响该块。
- “显示下一个挖空”按顺序逐个揭示。

### M01 思维导图基础

**字段**

```text
id: M01
type: mindmap
question: 观察下面的思维导图结构。
options:
answer:
notes: 用于测试思维导图节点渲染、折叠展开、移动端布局。
extra: {"mindmap":[{"text":"计算机网络","children":[{"text":"分层模型"},{"text":"TCP/IP"},{"text":"HTTP"}]}]}
audio:
```

**测试目标**

- 思维导图根节点和子节点渲染
- 折叠展开

**预期结果**

- 正面显示根节点和子节点。
- 点击切换按钮可折叠/展开。

### A01 音频播放器基础

**字段**

```text
id: A01
type: qa
question: 播放下面的音频并测试播放器。
options:
answer:
notes: 用于测试播放、暂停、倍速切换。若没有真实音频文件，可先替换成你现有媒体目录里的任意 mp3。
extra:
audio: [sound:test.mp3]
```

**测试目标**

- 播放 / 暂停
- 倍速切换

**预期结果**

- 正反面都出现播放器。
- 点击按钮能切换播放状态。
- 切换倍速后，播放速度改变。

## 复杂内容组

### C03 单选 + 公式 + 长解析

**字段**

```text
id: C03
type: choice
question: 若行内公式为 $a^2+b^2=c^2$，下列哪一项是块级展示？<br><br>注意测试公式与多段解析。
options: $x+y$||$$x^2+y^2=z^2$$||普通文本||<img src="screens/1-mac-single.png">
answer: 2
notes: 第一段：用于测试行内公式和块级公式。<br><br>第二段：这里加入较长解析文本，用于测试前面解析区域的滚动行为。你可以继续复制这一段多次，让内容足够长，以观察滚动是否稳定。<br><br>第三段：测试图片在解析中的缩放行为。<br><img src="screens/2-windows-single.png">
extra:
audio:
```

**测试目标**

- 公式
- 图片选项
- 长解析滚动

**预期结果**

- 题干和选项中的公式能正确渲染。
- 图片选项不应撑爆布局。
- 正面解析区受高度滑杆控制。

### Q02 问答 + 图片 + HTML

**字段**

```text
id: Q02
type: qa
question: 下面这张图展示了什么？<br><img src="screens/fields.png">
options:
answer: 这是模板字段示意图。
notes: <b>粗体测试</b><br><i>斜体测试</i><br><br><img src="screens/settings.png"><br>用于测试问答题中图片和 HTML 的显示。
extra:
audio:
```

**测试目标**

- 问答题中图片渲染
- HTML 富文本解析

**预期结果**

- 题干图片、解析图片都正常显示。
- 加粗、斜体、换行保留。

### F03 填空 + 公式 + 中英混排

**字段**

```text
id: F03
type: fill
question: 在公式 $$E = mc^2$$ 中，{{c1::E::符号}} 表示能量，speed of light 是 {{c2::c::符号}}，而质量是 {{c3::m::符号}}。
options:
answer: E||c||m
notes: 用于测试公式环境中多个填空、英文提示、中英混排。
extra:
audio:
```

**测试目标**

- 填空与公式混排
- 多语言文本

**预期结果**

- 输入框位置正确，不应打乱公式与文本流。

### O02 图片遮挡顺序测试

**字段**

```text
id: O02
type: occlusion
question: 用于测试“显示下一个挖空”的顺序。
options:
answer:
notes: 先把显示顺序设为“先上下后左右”，测一遍；再改成“先左右后上下”，重测。
extra: {"image":"screens/3-ubuntu-single.png","masks":[{"id":"1","x":8,"y":10,"w":12,"h":10,"label":"A"},{"id":"2","x":60,"y":12,"w":12,"h":10,"label":"B"},{"id":"3","x":12,"y":45,"w":12,"h":10,"label":"C"},{"id":"4","x":62,"y":50,"w":12,"h":10,"label":"D"}]}
audio:
```

**测试目标**

- 遮挡显示顺序配置

**预期结果**

- 两种顺序下，揭示顺序必须不同且符合设置。

### M02 思维导图 + 挖空

**字段**

```text
id: M02
type: mindmap
question: 验证导图节点内挖空。
options:
answer:
notes: 用于测试导图节点内的挖空展示和背面答案。
extra: {"mindmap":[{"text":"前端","children":[{"text":"框架：{{c1::React}}"},{"text":"样式：CSS"},{"text":"构建：Vite","children":[{"text":"插件系统"},{"text":"热更新"}]}]}]}
audio:
```

**测试目标**

- 节点内挖空
- 多层结构

**预期结果**

- 正面节点里应显示未揭示挖空。
- 背面节点里应显示答案。

## 边界与回归组

### R01 特殊字符牌组名 / 内容

**字段**

```text
id: R01
type: qa
question: 特殊字符测试：&lt;div&gt; "quote" 'single' [brackets] {braces} #hash
options:
answer: 特殊字符不应让模板崩溃。
notes: 解析里也加入相同字符：&lt;tag&gt; "double" 'single' {json}
extra:
audio:
```

**测试目标**

- 特殊字符兼容

**预期结果**

- 卡片正常显示，不应整张空白或脚本失效。

### R02 空解析

**字段**

```text
id: R02
type: qa
question: 这是一个没有解析的问答题。
options:
answer: 无解析时不应显示空白解析壳。
notes:
extra:
audio:
```

**测试目标**

- 空 `notes`

**预期结果**

- 正反面都不应显示多余解析容器。

### R03 非法 extra JSON

**字段**

```text
id: R03
type: occlusion
question: 非法 extra JSON 测试。
options:
answer:
notes: 用于测试 extra 非法时模板的降级能力。
extra: {"image":"broken.png","masks":[}
audio:
```

**测试目标**

- 非法 JSON 降级

**预期结果**

- 卡片不应崩掉。
- 最多降级成普通问答展示或空交互区。

### R04 长标签

**字段**

```text
id: R04
type: qa
question: 长标签显示测试。
options:
answer: 标签应换行显示。
notes: 给这张卡手工添加至少 8 个 tag。
extra:
audio:
```

**测试目标**

- 标签换行

**预期结果**

- 标签区自动换行，不应覆盖标题或按钮。

### R05 随机选项顺序一致性

**字段**

```text
id: R05
type: choice
question: 这张卡专门用于验证随机顺序正反面一致。
options: 选项A||选项B||选项C||选项D||选项E
answer: 4
notes: 开启随机顺序后，正面与背面的选项顺序必须完全一致。
extra:
audio:
```

**测试目标**

- 随机顺序持久化

**预期结果**

- 正面看到的 A/B/C/D/E 对应顺序，在背面必须保持一致。
- 多次进入同一张卡，直到切换设置前，顺序不应反复跳变。

### R06 状态隔离

**字段**

```text
id: R06
type: fill
question: 第一个空 {{c1::alpha}}，第二个空 {{c2::beta}}。
options:
answer: alpha||beta
notes: 本卡用于和 F02、O01 交叉测试状态隔离。
extra:
audio:
```

**测试目标**

- 不同卡状态隔离

**预期结果**

- 本卡输入内容不应污染 F02。
- 本卡切回后，自己的输入仍存在。

## 主路径最小回归集

如果你只想快速确认当前模板可用，至少测这 7 张：

1. `C01`
2. `C02`
3. `Q01`
4. `F02`
5. `O02`
6. `M01`
7. `A01`

## 完整回归建议顺序

1. 先桌面：`C01 -> C02 -> Q01 -> F01 -> F02 -> O01 -> O02 -> M01 -> A01`
2. 再桌面复杂内容：`C03 -> Q02 -> F03 -> M02`
3. 再桌面边界：`R01 -> R02 -> R03 -> R04 -> R05 -> R06`
4. 再到 AnkiDroid 跑“主路径最小回归集”
5. 再到 AnkiMobile 跑“主路径最小回归集”

## 记录模板

建议你每测一张卡都按下面格式记录：

```text
平台:
卡片 id:
测试项:
步骤:
实际结果:
是否通过:
备注:
```

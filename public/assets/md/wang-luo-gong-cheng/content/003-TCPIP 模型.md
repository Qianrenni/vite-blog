## **TCP/IP 模型**

TCP/IP（Transmission Control Protocol/Internet Protocol，传输控制协议/因特网互联协议）模型则是事实上的互联网标准，更直接地反映了互联网的实际工作方式。它通常被简化为四层，分别是：

1. **网络接口层（Network Interface Layer）**：对应于OSI模型的物理层和数据链路层，定义了如何在物理媒介上传输数据。
2. **互联网层（Internet Layer）**：类似于OSI模型的网络层，主要功能是负责将数据包从源地址发送到目的地址。
3. **传输层（Transport Layer）**：对应OSI模型的传输层，提供了端到端的数据传输服务，主要包括TCP和UDP协议。
4. **应用层（Application Layer）**：整合了OSI模型的会话层、表示层和应用层的功能，涵盖了所有高层协议，如HTTP、FTP等。
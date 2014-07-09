PictureSwap
===========

这是一个图片切换插件， 可以实现一些碎玻璃的效果


## Usage

实现图片切换只需以下的简单代码

**html**

        <div id="container">
        	<img src="./image/1.png" alt="image1" />
			<img src="./image/2.png" alt="image2" />
        </div>
       
**js**

        <script type="text/javascript">
        var runner = new Splash(document.getElementById('container'),{
            width: "700px",
            height: "300px",
            speed : 400,
            duration : 2000
        });
        runner.init();
        </script>



## 注意事项

图片的宽高必须与容器的宽高相同，否则会出现错位的情况。



### 可选参数：
1. width // 容器的宽
2. height // 容器的高
3. cube_map // 容器内小方块的数量，总共为 cube_map * cube_map个
4. isContinue // 是否轮播
5. duration // 动画结束后的时间间隔
6. index // 动画开始时的索引

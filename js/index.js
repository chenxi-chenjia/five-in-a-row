$(function(){
	$("body>div").css("min-height",$(window).height());
	$(window).on("resize",function(){
		$("body>div").css("min-height",$(window).height());
	})
//////////////////////////////////////////////////////////////变量
	var ls=$("#lsmusic").get(0);
	var canvas=$("canvas").get(0);
	var cxt=canvas.getContext("2d");
	var r =15; //棋子半径
	var flag=true;
	var storage;
	var clock=new Object;
	var bs,ws,bm,wm,bt,wt;
	var beginflag=true;
	var rztz=$("#rztz").get(0);
	var dmxy=$("#dmxy").get(0);
	var yasuo=$("#yasuo").get(0);
	var bj=$("#bjmusic").get(0);
	var ai; //电脑对战判断
/////////////////////////////////////////////////////////////
	// 界面进入人机游戏点击
	$("#welcome .options").on("click",".ai",function(){
		ai=true;
		$(this).addClass('click');
		$("#welcome").delay(1000).queue(function(){
			$(this).animate({opacity:0},function(){
				$(this).css("display","none")
				bj.pause();
				$("#gameInterface").css("display","block").animate({opacity:1});
			})
			$(this).dequeue();
		})
		b0();
	})
	// 联机对战点击
	$("#welcome .options").on("click",".pp",function(){
		yasuo.play();
		bj.pause();
		ai=false;
		$(this).addClass('click');
		$("#welcome").delay(1100).queue(function(){
			$(this).animate({opacity:0},function(){
				$(this).css("display","none")
				bj.pause();
				$("#ljym").css("display","block").animate({opacity:1});
			})
			$(this).dequeue();
		})
	})
	// 联机对战返回主页
	$("#ljym").on("click",".back",function(){
		dmxy.play();
		$("#ljym").animate({opacity:0}, function(){
			$(this).css("display","none");
			$("#welcome").css("display","block").animate({opacity:1}).find(".click").removeClass("click");
			$(this).css("display","none");
			bj.play();
		})
	})
	$("#ljym").on("click",'.pp',function(){
		$("#ljym").animate({opacity:0},function(){
			$("#ljym").css("display","none")
		})
		$("#gameInterface").css("display","block").animate({opacity:1},function(){
			b0();
		});
	})
	// 游戏开始
	$("#gameInterface").on("click",'.begin',function(){
		b0();
		gaming();
		rztz.play();
	})
	// 绘制棋谱调用
	$("#gameInterface").on("click",".save",function(){
		chip ();
		$("#gameInterface .win").removeClass('win');
		$('#gameInterface .saveimg').removeClass('saveimgclick').delay(1000).queue(function(){
			$(this).css("box-shadow","0 0 0 1000px rgba(0,0,0,.7)");
			$(this).dequeue();
		});
		$("<img>").attr("src",canvas.toDataURL()).appendTo('#gameInterface .saveimg>div').css({
			"hegiht":"100%",
			"width":"100%"
		})
		$("<a>").attr("href",canvas.toDataURL()).attr("download","纸上谈兵.png").appendTo('#gameInterface .saveimg>div').css({
			"position":"absolute",
			"top":0,
			"left":0,
			"height":"100%",
			"width":"100%"
		})
	})
	// 关闭棋谱调用
	$("#gameInterface .saveimg").on("click",".close",function(){
		$("#gameInterface .saveimg").addClass('saveimgclick').css("box-shadow","none").find("img").remove().end().find("a").remove();
		board ();
		$.each(storage,function(i,v){
			var x=parseInt(i.split("-")[0]);
			var y=parseInt(i.split("-")[1]);
			pieces(x,y,v);
		})
		return false;
	})
	// 返回主页面
	$("#gameInterface").on("click",".back",function(){
		dmxy.play();
		if(ai){
			$("#gameInterface").animate({opacity:0}, function(){
				$(this).css("display","none");
				$("#welcome").css("display","block").animate({opacity:1}).find(".click").removeClass("click");
				bj.play();
				canvas.onclick=null;
			})
		}else{
			$("#gameInterface").animate({opacity:0}, function(){
				$(this).css("display","none");
				$("#ljym").css("display","block").animate({opacity:1});
				canvas.onclick=null;
			})			
		}
	})

/////////////////////////////////////////////// 基础函数
	//数字处理
	function nd(x){
		return x*40+20.5;
	}
	// 开始游戏
	function gaming(){
		bs=0;
		ws=0;
		bm=0;
		wm=0;
		storage={};
		board(); //绘制棋盘
		flag=true;
		clearInterval(bt);
		clearInterval(wt);
		bt=setInterval(btime,1000);
		$("#gameInterface .cl").find("b").addClass('bnb');
		canvas.onclick=function(e){
			var x=Math.floor(e.offsetX/40);
			var y=Math.floor(e.offsetY/40);
			if(storage[x+"-"+y]){
				return;
			}
			if(flag){
				pieces(x,y,"black");
				clearInterval(bt);
				wt=setInterval(wtime,1000);
				$("#gameInterface .cl").find("b").removeClass('bnb');
				$("#gameInterface .cr").find("b").addClass('bnb');
				if(judge(x,y,"black")>4){
					$("#gameInterface .black").text("黑棋兄，你赢了！").addClass('win');
					canvas.onclick=null;
					clearInterval(wt);
				}
				if(ai){
					clearInterval(wt);
					bt=setInterval(btime,1000);
					var aiobj=AI();
					x=aiobj.split("-")[0];
					y=aiobj.split("-")[1];
					pieces(x,y,"white");console.log(storage);
					if(judge(x,y,"white")>4){
						$("#gameInterface .white").text("哈哈哈，你连电脑都打不过！").addClass('win');
						canvas.onclick=null;
						clearInterval(bt);
					}
					flag=!flag;
				}
			}else{
				pieces(x,y,"white");
				clearInterval(wt);
				bt=setInterval(btime,1000);
				$("#gameInterface .cr").find("b").removeClass('bnb');
				$("#gameInterface .cl").find("b").addClass('bnb');
				if(judge(x,y,"white")>4){
					$("#gameInterface .white").text("白棋兄，你赢了！！").addClass('win');
					canvas.onclick=null;
					clearInterval(bt);
				}
			}
			flag=!flag;
		}
	}
	// 绘制棋盘
	function board (){
		cxt.clearRect(0,0,600,600);
		for(var i=0;i<15;i++){
			cxt.beginPath();
			cxt.moveTo(nd(i),20.5);
			cxt.lineTo(nd(i),579.5);
			cxt.moveTo(20.5,nd(i));
			cxt.lineTo(579.5,nd(i));
			cxt.closePath();
			cxt.stroke();
		}
		// 绘制基本点
		basecot(3,3);
		basecot(11,3);
		basecot(7,7);
		basecot(3,11);
		basecot(11,11);
	}
	// 绘制五个基本点
	function basecot(x,y){
		cxt.save();
		cxt.beginPath();
		cxt.translate(nd(x),nd(y));
		cxt.arc(0,0,5,0,Math.PI*2);
		cxt.closePath();
		cxt.restore();
		cxt.fill();
	}
	// 绘制棋子
	function pieces(x,y,color){
		cxt.save();
		cxt.beginPath();
		cxt.translate(nd(x),nd(y));
		var b=cxt.createRadialGradient(-5,-5,1, 0, 0, 20);
		if(color=="black"){
			b.addColorStop(0.1,"#fff");
			b.addColorStop(0.2,"#000");
			b.addColorStop(1,"#000");
		}else{
			b.addColorStop(0.1,"#fff");
			b.addColorStop(0.2,"#eee");
			b.addColorStop(0.9,"#eee");
			b.addColorStop(1,"#ccc");
		}
		cxt.arc(0,0,r,0,Math.PI*2);
		cxt.shadowOffsetX = 2;
		cxt.shadowOffsetY = 2;
		cxt.shadowBlur = 2;
		cxt.shadowColor = "rgba(0, 0, 0, 0.5)";
		cxt.fillStyle=b;
		cxt.fill();
		cxt.closePath();
		cxt.restore();
		storage[x+"-"+y]=color;
		ls.play();
	}
	// 时间进程
	function tn(x){   //时间处理
		x=(x<10)?("0"+x):x;
		return x;
	}
	function btime(){
		bs++;
		if(bs>59){
			bs=0;
			bm++;
		}
		$("#gameInterface .cl .m").text(tn(bm));
		$("#gameInterface .cl .s").text(tn(bs));
	}
	function wtime(){
		ws++;
		if(ws>59){
			ws=0;
			wm++;
		}
		$("#gameInterface .cr .m").text(tn(wm));
		$("#gameInterface .cr .s").text(tn(ws));
	}
	// 棋局初始化
	function b0(){
		clearInterval(bt);
		clearInterval(wt);
		bs=0;
		ws=0;
		bm=0;
		wm=0;
		storage={};
		board(); //绘制棋盘
		flag=true;
		$("#gameInterface .m").text(tn(0));
		$("#gameInterface .s").text(tn(0));
		$("#gameInterface .bnb").removeClass('bnb');
		$("#gameInterface .black,#gameInterface .white").text("").removeClass("win");
	}
	// 判断输赢
	function M(x,y){
		return x+"-"+y;
	}
	function judge(x,y,color){
		var x=parseInt(x);
		var y=parseInt(y);
		var i;
		var row =1;
		i=1;while(storage[M(x+i,y)]==color){row++;i++};
		i=1;while(storage[M(x-i,y)]==color){row++;i++};
		var lie =1;
		i=1;while(storage[M(x,y+i)]==color){lie++;i++};
		i=1;while(storage[M(x,y-i)]==color){lie++;i++};
		var yx =1;
		i=1;while(storage[M(x+i,y+i)]==color){yx++;i++};
		i=1;while(storage[M(x-i,y-i)]==color){yx++;i++};
		var zx =1;
		i=1;while(storage[M(x+i,y-i)]==color){zx++;i++};
		i=1;while(storage[M(x-i,y+i)]==color){zx++;i++};
		return Math.max(row,lie,yx,zx);
	}
	// 绘制棋谱
	function chip (){
		var n=1;
		for(var i in storage){
			var x=parseInt(i.split("-")[0]);
			var y=parseInt(i.split("-")[1]);
			cxt.save();
			cxt.translate(nd(x),nd(y));
			cxt.beginPath();
			cxt.font="16px/20px Arial";
			if(storage[i]=="white"){
				cxt.fillStyle="#000";
			}else{
				cxt.fillStyle="#fff";
			}
			cxt.textAlign="center";
			cxt.textBaseline="middle";
			cxt.fillText(n,0,0);
			cxt.closePath();
			cxt.restore();
			n++;
		}
	}
	// 电脑AI
	function AI () {
		var bobj="";
		var wobj="";
		var bwm=0;
		var wwm=0;
		for(var i=0;i<15;i++){
			for(var j=0;j<15;j++){
				if(!storage[i+"-"+j]){
					if(judge(i,j,"black")>bwm){
						bwm=judge(i,j,"black");
						bobj=i+"-"+j;
					}
					if(judge(i,j,"white")>wwm){
						wwm=judge(i,j,"white");
						wobj=i+"-"+j;
					}
				}
			}
		}
		if(bwm>=wwm){
			return bobj;
		}else{
			return wobj;
		}
	}
})
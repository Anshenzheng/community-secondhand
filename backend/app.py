import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from models import db, User, Category, Item, Message

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)
db.init_app(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    user = User(
        username=data['username'],
        password=data['password'],
        phone=data.get('phone', ''),
        room_number=data.get('room_number', '')
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功', 'user': user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if not user:
        return jsonify({'error': '用户名或密码错误'}), 401
    
    session['user_id'] = user.id
    return jsonify({'message': '登录成功', 'user': user.to_dict()}), 200

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    if data['username'] == app.config['ADMIN_USERNAME'] and data['password'] == app.config['ADMIN_PASSWORD']:
        session['admin_logged_in'] = True
        return jsonify({'message': '管理员登录成功', 'admin': {'username': data['username']}}), 200
    
    return jsonify({'error': '用户名或密码错误'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': '退出成功'}), 200

@app.route('/api/current-user', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '未登录'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify(user.to_dict()), 200

@app.route('/api/categories', methods=['GET', 'POST'])
def categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([c.to_dict() for c in categories]), 200
    
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    data = request.json
    if not data or not data.get('name'):
        return jsonify({'error': '分类名称不能为空'}), 400
    
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': '分类名称已存在'}), 400
    
    category = Category(
        name=data['name'],
        description=data.get('description', '')
    )
    db.session.add(category)
    db.session.commit()
    
    return jsonify({'message': '分类创建成功', 'category': category.to_dict()}), 201

@app.route('/api/categories/<int:category_id>', methods=['PUT', 'DELETE'])
def category_detail(category_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': '分类不存在'}), 404
    
    if request.method == 'PUT':
        data = request.json
        if data.get('name'):
            existing = Category.query.filter_by(name=data['name']).first()
            if existing and existing.id != category_id:
                return jsonify({'error': '分类名称已存在'}), 400
            category.name = data['name']
        if data.get('description') is not None:
            category.description = data['description']
        
        db.session.commit()
        return jsonify({'message': '分类更新成功', 'category': category.to_dict()}), 200
    
    if request.method == 'DELETE':
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': '分类删除成功'}), 200

@app.route('/api/items', methods=['GET', 'POST'])
def items():
    if request.method == 'GET':
        query = Item.query.filter_by(status='approved')
        
        category_id = request.args.get('category_id')
        if category_id:
            query = query.filter_by(category_id=int(category_id))
        
        min_price = request.args.get('min_price')
        if min_price:
            query = query.filter(Item.price >= float(min_price))
        
        max_price = request.args.get('max_price')
        if max_price:
            query = query.filter(Item.price <= float(max_price))
        
        keyword = request.args.get('keyword')
        if keyword:
            query = query.filter(
                Item.title.contains(keyword) | 
                Item.description.contains(keyword)
            )
        
        items = query.order_by(Item.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '需要登录'}), 401
    
    if 'images' not in request.files:
        return jsonify({'error': '没有上传图片'}), 400
    
    images = request.files.getlist('images')
    image_urls = []
    
    for image in images:
        if image and image.filename and allowed_file(image.filename):
            filename = secure_filename(image.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image.save(filepath)
            image_urls.append(f"/api/uploads/{unique_filename}")
    
    title = request.form.get('title')
    description = request.form.get('description')
    price = request.form.get('price')
    category_id = request.form.get('category_id')
    
    if not title or not description or not price or not category_id:
        return jsonify({'error': '请填写完整的商品信息'}), 400
    
    item = Item(
        title=title,
        description=description,
        price=float(price),
        images=','.join(image_urls),
        owner_id=user_id,
        category_id=int(category_id),
        status='pending'
    )
    db.session.add(item)
    db.session.commit()
    
    return jsonify({'message': '商品发布成功，等待审核', 'item': item.to_dict()}), 201

@app.route('/api/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
def item_detail(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'error': '商品不存在'}), 404
    
    if request.method == 'GET':
        return jsonify(item.to_dict()), 200
    
    user_id = session.get('user_id')
    is_admin = session.get('admin_logged_in')
    
    if not user_id and not is_admin:
        return jsonify({'error': '需要登录'}), 401
    
    if not is_admin and item.owner_id != user_id:
        return jsonify({'error': '没有权限修改此商品'}), 403
    
    if request.method == 'PUT':
        data = request.json
        if data.get('title'):
            item.title = data['title']
        if data.get('description'):
            item.description = data['description']
        if data.get('price'):
            item.price = float(data['price'])
        if data.get('category_id'):
            item.category_id = int(data['category_id'])
        if data.get('status') and is_admin:
            item.status = data['status']
        
        db.session.commit()
        return jsonify({'message': '商品更新成功', 'item': item.to_dict()}), 200
    
    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': '商品删除成功'}), 200

@app.route('/api/admin/items', methods=['GET'])
def admin_items():
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    status = request.args.get('status')
    query = Item.query
    
    if status:
        query = query.filter_by(status=status)
    
    items = query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/admin/items/<int:item_id>/approve', methods=['POST'])
def approve_item(item_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'error': '商品不存在'}), 404
    
    item.status = 'approved'
    db.session.commit()
    return jsonify({'message': '商品审核通过', 'item': item.to_dict()}), 200

@app.route('/api/admin/items/<int:item_id>/reject', methods=['POST'])
def reject_item(item_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'error': '商品不存在'}), 404
    
    item.status = 'rejected'
    db.session.commit()
    return jsonify({'message': '商品审核不通过', 'item': item.to_dict()}), 200

@app.route('/api/admin/items/<int:item_id>/remove', methods=['POST'])
def remove_item(item_id):
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'error': '商品不存在'}), 404
    
    item.status = 'removed'
    db.session.commit()
    return jsonify({'message': '商品已下架', 'item': item.to_dict()}), 200

@app.route('/api/items/<int:item_id>/messages', methods=['GET', 'POST'])
def item_messages(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'error': '商品不存在'}), 404
    
    if request.method == 'GET':
        messages = Message.query.filter_by(item_id=item_id).order_by(Message.created_at.asc()).all()
        return jsonify([m.to_dict() for m in messages]), 200
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '需要登录'}), 401
    
    data = request.json
    if not data or not data.get('content'):
        return jsonify({'error': '留言内容不能为空'}), 400
    
    message = Message(
        content=data['content'],
        sender_id=user_id,
        item_id=item_id
    )
    db.session.add(message)
    db.session.commit()
    
    return jsonify({'message': '留言成功', 'message_data': message.to_dict()}), 201

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    if not session.get('admin_logged_in'):
        return jsonify({'error': '需要管理员权限'}), 403
    
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route('/api/my-items', methods=['GET'])
def my_items():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': '需要登录'}), 401
    
    items = Item.query.filter_by(owner_id=user_id).order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items]), 200

def init_db():
    with app.app_context():
        db.create_all()
        
        if not Category.query.first():
            categories = [
                Category(name='家用电器', description='电视、冰箱、洗衣机等家电'),
                Category(name='数码产品', description='手机、电脑、相机等数码设备'),
                Category(name='家具家居', description='桌椅、床柜、装饰品等'),
                Category(name='图书文具', description='书籍、文具、办公用品等'),
                Category(name='母婴用品', description='婴儿车、玩具、衣物等'),
                Category(name='运动户外', description='健身器材、运动装备等'),
                Category(name='服饰箱包', description='衣服、鞋子、包包等'),
                Category(name='其他', description='其他闲置物品')
            ]
            for c in categories:
                db.session.add(c)
            db.session.commit()
            print('默认分类已创建')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)

window.addEventListener('load', () => {
   UI.loadComments();
});

class Comment {
   constructor(parentId, id, name, message) {
      this.parentId = parentId;
      this.id = id;
      this.name = name;
      this.message = message;
      this.isLiked = false;
      this.isDissiked = false;
      this.reply = []; // Array of Comment;
   }
}

class UI {
   static loadComments() {
      const comments = Store.getComments();

      comments.forEach((comment) => {
         UI.addComment(comment);
      });
   }

   static addComment(comment) {
      const commentLists = document.querySelector('.comment-lists');

      const ul = document.createElement('ul');
      ul.id = 'ul-' + comment.parentId;

      ul.innerHTML = `
        <li id="li-${comment.parentId}-${comment.id}">
            <span>${comment.name}: </span>
            <p>${comment.message}</p>
            <a href="javascript:void(0)" id="like-${comment.parentId}-${comment.id}"><i class="fas fa-thumbs-up"></i></a>
            <a href="javascript:void(0)" id="dislike-${comment.parentId}-${comment.id}"><i class="fas fa-thumbs-down"></i></a>
            <a href="javascript:void(0)" id="reply-${comment.parentId}-${comment.id}">Reply</a>
            <a href="javascript:void(0)" id="delete-${comment.parentId}-${comment.id}">Delete</a>
        </li>
      `;
      commentLists.appendChild(ul);
   }

   static likeComment(parentId, nodeId) {
      const dislike = document.querySelector(`#dislike-${parentId}-${nodeId}`);
      dislike.classList.remove('dislike');

      const like = document.querySelector(`#like-${parentId}-${nodeId}`);
      like.classList.add('like');
   }

   static dislikeComment(parentId, nodeId) {
      const like = document.querySelector(`#like-${parentId}-${nodeId}`);
      like.classList.remove('like');

      const dislike = document.querySelector(`#dislike-${parentId}-${nodeId}`);
      dislike.classList.add('dislike');
   }

   static deleteComment(parentId, nodeId) {
      const parentUl = document.querySelector('#ul-' + parentId);

      if (parentUl.children.length == 1) {
         parentUl.remove();
      } else {
         const li = document.querySelector(`#li-${parentId}-${nodeId}`);
         li.remove();
      }
   }

   static alertOnCommentAdd() {
      const alert = document.querySelector('.alert');
      const text = document.querySelector('.alert h2');
      text.textContent = 'Successfully comment added.';
      alert.classList.remove('success-delete');
      alert.classList.add('success-add');
      alert.style.visibility = 'visible';

      setTimeout(() => {
         alert.style.visibility = 'hidden';
      }, 500);
   }

   static alertOnCommentDelete() {
      const alert = document.querySelector('.alert');
      const text = document.querySelector('.alert h2');
      text.textContent = 'Successfully comment deleted.';
      alert.classList.remove('success-add');
      alert.classList.add('success-delete');
      alert.style.visibility = 'visible';

      setTimeout(() => {
         alert.style.visibility = 'hidden';
      }, 500);
   }

   static addReplyBox(parentId, nodeId) {
      const li = document.querySelector(`#li-${parentId}-${nodeId}`);
      const div = document.createElement('div');
      div.classList.add('reply-box');
      div.id = `replyBox-${parentId}-${nodeId}`;
      div.innerHTML = `
         <input
            type="text"
            name="replyName-${parentId}-${nodeId}"
            placeholder="Enter your name..."
         />
         <textarea
            name="replyComment-${parentId}-${nodeId}"
            placeholder="Enter you comment..."
         ></textarea>
         <button type="button" id="addReply-${parentId}-${nodeId}">Add</button>
         <button type="button" id="clearReply-${parentId}-${nodeId}">Cancle</button>
      `;

      li.appendChild(div);
   }

   static closeReplyBox(parentId, nodeId) {
      const div = document.querySelector(`#replyBox-${parentId}-${nodeId}`);
      div.remove();
   }
}

class Utils {
   static clearFields() {
      document.querySelector('input[name="name"]').value = '';
      document.querySelector('textarea[name="comment"]').value = '';
   }
}

class Store {
   static getComments() {
      let comments;
      if (!localStorage.getItem('comments')) {
         comments = [];
      } else {
         comments = JSON.parse(localStorage.getItem('comments'));
      }

      return comments;
   }

   static addComment(comment) {
      const comments = Store.getComments();
      comments.push(comment);

      Store.updateLocalStorage(comments);
   }

   static getCommentByParentAndNodeId(parentId, nodeId) {
      const comments = Store.getComments();

      const comment = comments.find((c) => c.parentId == parentId && c.id == nodeId);

      return comment;
   }

   static updateComment(comment) {
      const comments = Store.getComments();

      const commentIndex = comments.findIndex(
         (c) => c.parentId == comment.parentId && c.id == comment.id
      );

      comments[commentIndex] = comment;

      Store.updateLocalStorage(comments);
   }

   static updateLocalStorage(comments) {
      localStorage.setItem('comments', JSON.stringify(comments));
   }

   static likeComment(parentId, nodeId) {
      const comment = Store.getCommentByParentAndNodeId(parentId, nodeId);
      comment.isLiked = true;
      comment.isDissiked = false;

      Store.updateComment(comment);
   }

   static dislikeComment(parentId, nodeId) {
      const comment = Store.getCommentByParentAndNodeId(parentId, nodeId);
      comment.isLiked = false;
      comment.isDissiked = true;

      Store.updateComment(comment);
   }

   static deleteComment(parentId, nodeId) {
      const comments = Store.getComments();
      const updatedComments = comments.filter(
         (comment) => comment.parentId != parentId && comment.nodeId != nodeId
      );

      Store.updateLocalStorage(updatedComments);
   }

   static replyComment(replyMessage) {
      const comments = Store.getComments();
      comments.push(replyMessage);

      Store.updateLocalStorage(comments);
   }
}

document.querySelector('#addComment').addEventListener('click', () => {
   const name = document.querySelector('input[name="name"]').value;
   const comment = document.querySelector('textarea[name="comment"]').value;

   if (name.length === 0 || comment.length === 0) {
      alert('please add name and comment..!!');
      return;
   }

   const id = Math.round(Math.random() * 1000 + 1);

   const commentMessage = new Comment(id, 1, name, comment);

   UI.alertOnCommentAdd();

   UI.addComment(commentMessage);

   Store.addComment(commentMessage);

   Utils.clearFields();
});

document.querySelector('.comment-lists').addEventListener('click', (e) => {
   if (e.target.nodeName === 'I') {
      if (e.target.parentNode.id.includes('dislike')) {
         const dislikeId = e.target.parentNode.id;
         const parentId = dislikeId.slice(
            dislikeId.indexOf('-') + 1,
            dislikeId.lastIndexOf('-')
         );
         const nodeId = dislikeId.substr(dislikeId.lastIndexOf('-') + 1);

         UI.dislikeComment(parentId, nodeId);
         Store.dislikeComment(parentId, nodeId);
      } else if (e.target.parentNode.id.includes('like')) {
         const likeId = e.target.parentNode.id;
         const parentId = likeId.slice(likeId.indexOf('-') + 1, likeId.lastIndexOf('-'));
         const nodeId = likeId.substr(likeId.lastIndexOf('-') + 1);

         UI.likeComment(parentId, nodeId);
         Store.likeComment(parentId, nodeId);
      }
   } else if (e.target.nodeName === 'A') {
      if (e.target.id.includes('delete')) {
         const deleteId = e.target.id;
         const parentId = deleteId.slice(
            deleteId.indexOf('-') + 1,
            deleteId.lastIndexOf('-')
         );
         const nodeId = deleteId.substr(deleteId.lastIndexOf('-') + 1);

         UI.alertOnCommentDelete();

         UI.deleteComment(parentId, nodeId);
         Store.deleteComment(parentId, nodeId);
      } else if (e.target.id.includes('reply')) {
         const replyId = e.target.id;
         const parentId = replyId.slice(
            replyId.indexOf('-') + 1,
            replyId.lastIndexOf('-')
         );
         const nodeId = replyId.substr(replyId.lastIndexOf('-') + 1);

         UI.addReplyBox(parentId, nodeId);
      }
   } else if (e.target.nodeName === 'BUTTON') {
      if (e.target.id.includes('clearReply')) {
         const replyBoxId = e.target.id;
         const parentId = replyBoxId.slice(
            replyBoxId.indexOf('-') + 1,
            replyBoxId.lastIndexOf('-')
         );
         const nodeId = replyBoxId.substr(replyBoxId.lastIndexOf('-') + 1);

         UI.closeReplyBox(parentId, nodeId);
      } else if (e.target.id.includes('addReply')) {
         const replyId = e.target.id;
         const parentId = replyId.slice(
            replyId.indexOf('-') + 1,
            replyId.lastIndexOf('-')
         );
         const nodeId = replyId.substr(replyId.lastIndexOf('-') + 1);
         console.log(parentId, nodeId);
         const name = document.querySelector(
            `input[name="replyName-${parentId}-${nodeId}"]`
         ).value;
         const reply = document.querySelector(
            `textarea[name="replyComment-${parentId}-${nodeId}"]`
         ).value;
         const id = Math.round(Math.random() * 1000 + 1);

         const replyMessage = new Comment(nodeId, id, name, reply);

         UI.alertOnCommentAdd();

         Store.replyComment(replyMessage);
         // UI.closeReplyBox(parentId);
      }
   }
});
